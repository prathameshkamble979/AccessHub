import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Otp from '../models/Otp';
import { sendOtpEmail } from '../utils/sendEmail';

// @desc    Send OTP for forgot password
// @route   POST /api/otp/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { identifier, method } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(generatedOtp, salt);

    // Remove any existing OTP and save new one
    await Otp.deleteMany({ identifier });
    await Otp.create({ identifier, otp: hashedOtp });

    // Send OTP via Email or SMS
    const isEmail = identifier.includes('@');

    if (isEmail && method === 'email') {
      try {
        await sendOtpEmail(identifier, generatedOtp);
      } catch (emailError) {
        // Fallback: log to console if email config is not set up yet
        console.warn('[EMAIL FALLBACK] Email not configured. OTP:', generatedOtp);
      }
    } else {
      // SMS placeholder — integrate Twilio or similar here
      console.log(`[MOCK SMS] OTP for ${identifier}: ${generatedOtp}`);
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { identifier, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ identifier });

    if (!otpRecord) {
      res.status(400).json({ message: 'OTP expired or invalid' });
      return;
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (isValid) {
      res.json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/otp/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { identifier, otp, newPassword } = req.body;

  try {
    const otpRecord = await Otp.findOne({ identifier });

    if (!otpRecord) {
      res.status(400).json({ message: 'OTP expired or invalid' });
      return;
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findOneAndUpdate(
      { $or: [{ email: identifier }, { phone: identifier }] },
      { password: hashedPassword }
    );

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
