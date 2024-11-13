import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAqgRa3CEhhmn_7kIjPlIkGeYNwBkBSQi0",
    authDomain: "uitpay-6021c.firebaseapp.com",
    databaseURL: "https://uitpay-6021c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "uitpay-6021c",
    storageBucket: "uitpay-6021c.firebasestorage.app",
    messagingSenderId: "481531309825",
    appId: "1:481531309825:web:cf31c98a9e56bd9c3b7500",
    measurementId: "G-0N0B9S9M5W"
  };
  

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { app, analytics, db, rtdb }; 