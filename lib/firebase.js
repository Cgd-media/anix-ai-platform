import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIG5Gf33PJaTMmoQ-ckA6kj8mXiyElEmE",
  authDomain: "anix-ai.firebaseapp.com",
  projectId: "anix-ai",
  storageBucket: "anix-ai.firebasestorage.app",
  messagingSenderId: "635931190397",
  appId: "1:635931190397:web:43e470878cdd36fcd5fd14",
  measurementId: "G-0453VNTVNR",
};

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);