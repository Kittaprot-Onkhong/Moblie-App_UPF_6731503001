import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (คัดลอกมาจาก console)
const firebaseConfig = {
  apiKey: "AIzaSyDDKwfrZaVrVReYIinl3kDghG3BRP71ykE",
  authDomain: "upf001-b206e.firebaseapp.com",
  projectId: "upf001-b206e",
  storageBucket: "upf001-b206e.firebasestorage.app",
  messagingSenderId: "1069109570044",
  appId: "1:1069109570044:web:0cade93c4ecbc10d08ea79",
  measurementId: "G-Q8VWB9BW0H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional: analytics (web only)
import { getAnalytics } from 'firebase/analytics';
export const analytics = getAnalytics(app);


// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// ตั้ง persistence เพื่อให้ login อยู่ต่อเมื่อปิดแอป
try {
  setPersistence(auth, browserLocalPersistence);
} catch (error) {
  console.log('Persistence not supported:', error);
}

// ฟังก์ชันสำหรับลงทะเบียน
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
      },
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ฟังก์ชันสำหรับเข้าสู่ระบบ
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || email.split('@')[0],
      },
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ฟังก์ชันสำหรับออกจากระบบ
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
