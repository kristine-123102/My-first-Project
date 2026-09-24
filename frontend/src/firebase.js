import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD3cTKfKFgJKOV-WS5fXO9eLV0mQpHLNU8",
  authDomain: "inventory-firebase-f7a53.firebaseapp.com",
  projectId: "inventory-firebase-f7a53",
  storageBucket: "inventory-firebase-f7a53.firebasestorage.app",
  messagingSenderId: "282165330757",
  appId: "1:282165330757:web:fb68f90260a2d2cc27742c",
  measurementId: "G-P3B63RBT9W"
};


const app = initializeApp(
  firebaseConfig
);


export const auth =
  getAuth(app);


export const db =
  getFirestore(app);


/*
  Google Login

  This forces Google to show
  the account selection screen.
*/
export const googleProvider =
  new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});


export default app;
