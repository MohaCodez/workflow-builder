import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBW-p9rvaThBqsHtph1nXHPH-VR0cRMRHc",
  authDomain: "work-flow-builder.firebaseapp.com",
  projectId: "work-flow-builder",
  storageBucket: "work-flow-builder.firebasestorage.app",
  messagingSenderId: "525917605146",
  appId: "1:525917605146:web:6f2b41dcb9c29cbb57f0a3"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);