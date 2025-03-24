// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXYTJQygNR2xQSP420TG1jOWk5mtoCW7w",
  authDomain: "camyo-chat.firebaseapp.com",
  projectId: "camyo-chat",
  storageBucket: "camyo-chat.firebasestorage.app",
  messagingSenderId: "1053523298293",
  appId: "1:1053523298293:web:a0c88201aa7fad987042bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);