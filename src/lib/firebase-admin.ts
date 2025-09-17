import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminAuth: Auth;
let adminStorage: Storage;
let adminFirestore: Firestore;

// Initialize Firebase Admin SDK
if (!getApps().length) {
    try {
        // Validate required environment variables
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

        if (!projectId || !clientEmail || !privateKey) {
            console.warn('Firebase Admin SDK: Missing required environment variables');
            // Create a minimal app for build compatibility
            adminApp = initializeApp({
                projectId: 'build-placeholder'
            });
        } else {
            // Format private key properly
            const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

            // Initialize with service account credentials
            adminApp = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey: formattedPrivateKey,
                }),
                projectId,
                storageBucket,
            });
        }

        adminAuth = getAuth(adminApp);
        adminStorage = getStorage(adminApp);
        adminFirestore = getFirestore(adminApp);
    } catch (error) {
        console.error('Firebase Admin SDK initialization error:', error instanceof Error ? error.message : String(error));
        // Fallback initialization for build compatibility
        adminApp = initializeApp({
            projectId: 'build-fallback'
        });
        adminAuth = getAuth(adminApp);
        adminStorage = getStorage(adminApp);
        adminFirestore = getFirestore(adminApp);
    }
} else {
    adminApp = getApps()[0] as App;
    adminAuth = getAuth(adminApp);
    adminStorage = getStorage(adminApp);
    adminFirestore = getFirestore(adminApp);
}

export { adminApp, adminAuth, adminStorage, adminFirestore };
