// استيراد الخدمات المطلوبة من Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// بيانات مشروعك الخاصة بـ One Piece Store
const firebaseConfig = {
    apiKey: "AIzaSyCiWFUbhIT-OxuQwq7CkiClT0W7PtXBUyA",
    authDomain: "one-piece-store.firebaseapp.com",
    projectId: "one-piece-store",
    storageBucket: "one-piece-store.firebasestorage.app",
    messagingSenderId: "673026171867",
    appId: "1:673026171867:web:d186ec5f39bf8d8599bdfe",
    measurementId: "G-MSKYRPGJ48"
};

// تهيئة التطبيق وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, doc, updateDoc, onSnapshot, query, where, orderBy };
