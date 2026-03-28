import * as admin from "firebase-admin";
import serviceAccount from "../../../math-mate-d6532-firebase-adminsdk-fbsvc-45b3461299.json";

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || serviceAccount.client_email;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
      : serviceAccount.private_key;

    console.log('--- Firebase Admin Debug ---');
    console.log('Project ID:', projectId);
    console.log('Client Email:', clientEmail);
    console.log('Private Key Found:', !!privateKey);
    console.log('Private Key Start:', privateKey?.substring(0, 30));

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
