// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBO25c2-SHY0s0CUQG2INzLi2iF0sOMokw",
  authDomain: "vasa-f16c8.firebaseapp.com",
  projectId: "vasa-f16c8",
  storageBucket: "vasa-f16c8.firebasestorage.app",
  messagingSenderId: "510440927810",
  appId: "1:510440927810:web:d914ba5a159eee24f273db",
  measurementId: "G-P16XLEKLFF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);