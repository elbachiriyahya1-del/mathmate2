import * as admin from "firebase-admin";


if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Handle both actual newlines and literal '\n' characters depending on how Vercel/Next injects it
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
      : undefined;

    console.log('--- Firebase Admin Debug ---');
    console.log('Project ID:', projectId);
    console.log('Client Email:', clientEmail);
    console.log('Private Key Found:', !!privateKey);
    console.log('Private Key Start:', privateKey?.substring(0, 30));

    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
        });
    } else {
        console.warn("Firebase Admin missing environment variables. Trying default initialization.");
        admin.initializeApp();
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
