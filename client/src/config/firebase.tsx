// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZSymJnOLgjPvWSXJym8b0w5jzcMWP97g",
  authDomain: "accesshub-52fa6.firebaseapp.com",
  projectId: "accesshub-52fa6",
  storageBucket: "accesshub-52fa6.firebasestorage.app",
  messagingSenderId: "954067505654",
  appId: "1:954067505654:web:c9075ec057f2ab4596f7d7",
  measurementId: "G-Q96BGJC2K6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);