// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from '@firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import envConfig from './envConfig';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: envConfig.FIREBASE_API_KEY,
  authDomain: envConfig.FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.FIREBASE_PROJECT_ID,
  storageBucket: envConfig.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.FIREBASE_SENDER_ID,
  appId: envConfig.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
