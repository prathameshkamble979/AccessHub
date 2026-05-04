import admin from 'firebase-admin';

let initialized = false;

function getPrivateKey(): string | undefined {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!rawKey) return undefined;
  return rawKey.replace(/\\n/g, '\n');
}

export function getFirebaseAdmin(): admin.app.App {
  if (initialized) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin config: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
  return admin.app();
}
