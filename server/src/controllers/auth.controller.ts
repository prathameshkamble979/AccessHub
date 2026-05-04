import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import generateToken from '../utils/generateToken';

interface FirebaseTokenPayload extends jwt.JwtPayload {
  user_id: string;
  email?: string;
  name?: string;
  picture?: string;
}

let cachedGoogleCerts: Record<string, string> | null = null;
let googleCertsExpiryMs = 0;

function getMaxAgeFromCacheControl(cacheControl: string | null): number {
  if (!cacheControl) return 3600;
  const match = cacheControl.match(/max-age=(\d+)/);
  return match ? Number(match[1]) : 3600;
}

async function getGoogleSecureTokenCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedGoogleCerts && now < googleCertsExpiryMs) {
    return cachedGoogleCerts;
  }

  const response = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );

  if (!response.ok) {
    throw new Error('Unable to fetch Google token certificates');
  }

  const certs = (await response.json()) as Record<string, string>;
  const maxAgeSeconds = getMaxAgeFromCacheControl(response.headers.get('cache-control'));
  cachedGoogleCerts = certs;
  googleCertsExpiryMs = now + maxAgeSeconds * 1000;
  return certs;
}

async function verifyFirebaseIdToken(idToken: string, expectedProjectId?: string): Promise<FirebaseTokenPayload> {
  const decoded = jwt.decode(idToken, { complete: true });
  const kid = decoded && typeof decoded === 'object' ? decoded.header?.kid : undefined;
  const unsafePayload = decoded && typeof decoded === 'object' ? decoded.payload as jwt.JwtPayload : undefined;
  const tokenProjectId = typeof unsafePayload?.aud === 'string' ? unsafePayload.aud : undefined;

  if (!kid) {
    throw new Error('Invalid token header');
  }
  if (!tokenProjectId) {
    throw new Error('Invalid token audience');
  }

  const projectId = expectedProjectId || tokenProjectId;

  const certs = await getGoogleSecureTokenCerts();
  const cert = certs[kid];
  if (!cert) {
    throw new Error('Unknown token signing key');
  }

  const payload = jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  }) as FirebaseTokenPayload;

  if (expectedProjectId && payload.aud !== expectedProjectId) {
    throw new Error('Token project mismatch');
  }

  return payload;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      authProvider: 'local',
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token: generateToken(String(user._id)),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;

  try {
    // Check for user email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token: generateToken(String(user._id)),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Authenticate/register a user with Firebase Google token
// @route   POST /api/auth/google
// @access  Public
export const loginWithGoogle = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  try {
    const decoded = await verifyFirebaseIdToken(idToken, process.env.FIREBASE_PROJECT_ID);

    if (!decoded.email) {
      res.status(400).json({ message: 'Google account email is required' });
      return;
    }

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = await User.create({
        name: decoded.name || decoded.email.split('@')[0] || 'User',
        email: decoded.email,
        profilePicture: decoded.picture,
        firebaseUid: decoded.user_id,
        authProvider: 'google',
      });
    } else {
      let hasChanges = false;
      if (decoded.name && user.name !== decoded.name) {
        user.name = decoded.name;
        hasChanges = true;
      }
      if (decoded.picture && user.profilePicture !== decoded.picture) {
        user.profilePicture = decoded.picture;
        hasChanges = true;
      }
      if (decoded.user_id && user.firebaseUid !== decoded.user_id) {
        user.firebaseUid = decoded.user_id;
        hasChanges = true;
      }
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save();
      }
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      token: generateToken(String(user._id)),
    });
  } catch (error: any) {
    console.error('Google auth verification failed:', error?.code || error?.message || error);
    const message =
      error?.name === 'TokenExpiredError'
        ? 'Google session expired. Please sign in again.'
        : 'Invalid Google token';
    res.status(401).json({ message });
  }
};
