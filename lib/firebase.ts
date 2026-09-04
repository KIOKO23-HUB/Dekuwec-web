// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCxJUi5tTfWHDRQutRzswh59jzZ8-QQX_A",
  authDomain: "dekuwec-web.firebaseapp.com",
  databaseURL: "https://dekuwec-web-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dekuwec-web",
  storageBucket: "dekuwec-web.firebasestorage.app",
  messagingSenderId: "34755257116",
  appId: "1:34755257116:web:1c7cdd4e6d0e0e2a9f50d9",
  measurementId: "G-65VMWYLY64"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
