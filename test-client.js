const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Using API Key:", firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testWebSDK() {
  try {
    console.log("Attempting sign in with dummy credentials to trigger auth flow...");
    await signInWithEmailAndPassword(auth, "yahyayahya44@gmail.com", "dummy_password_test");
  } catch(err) {
    console.error("Auth throw error:", err.code, err.message);
    if(err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'){
        console.log("It successfully talked to the server! (Good sign)");
    } else {
        console.log("CRITICAL AUTH FAILURE!");
        return;
    }
  }

  try {
    console.log("Attempting Firestore getDoc...");
    const d = await getDoc(doc(db, "users", "test"));
    console.log("Firestore success! Doc exists:", d.exists());
  } catch(err) {
    console.error("Firestore throw error:", err.message);
  }
  process.exit(0);
}

testWebSDK();
