import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-domain.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock-bucket.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For development without Firebase, we will mock auth/db responses
// when using the app, until real config is provided.
