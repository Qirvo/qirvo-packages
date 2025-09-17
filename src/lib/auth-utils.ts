import { NextRequest } from 'next/server';
import clientPromise  from './mongodb';

/**
 * Retrieves the current user from the request context using Firebase Auth.
 * Extracts and validates Firebase ID token from Authorization header.
 * @param request The Next.js request object
 * @returns The current user object or null if not authenticated
 */
export async function getCurrentUser(request: NextRequest): Promise<{ id: string, email: string, role?: string } | null> {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return null;
    }

    // Import Firebase Admin SDK
    // Verify Firebase ID token
    const admin = await import('firebase-admin');

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        return null;
      }

      const serviceAccount = {
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;
    const uid = decodedToken.uid;

    if (!email) {
      return null;
    }

    // Look up user in MongoDB by Firebase UID (stored as _id)
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('User').findOne({ _id: uid as any });

    if (!user) {
      // User should exist if they registered properly
      // This might happen for legacy users or edge cases
      return null; // Don't create duplicate - let registration flow handle it
    }

    return { id: user._id.toString(), email: user.email, role: user.role || 'user' };
  } catch {
    return null; // On any error, treat as unauthenticated
  }
}
