import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  // ✅ FIX: ลบ browserLocalPersistence ออก — ใช้ได้เฉพาะ web เท่านั้น
  // บน React Native / Expo ไม่ต้องตั้ง persistence เอง
} from 'firebase/auth';

// ✅ FIX: ลบ signInWithPopup ออก — ใช้ไม่ได้บน native mobile
// Google Sign-In บน mobile ต้องใช้ expo-auth-session แทน (ทำใน screen แล้ว)

import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDKwfrZaVrVReYIinl3kDghG3BRP71ykE",
  authDomain: "upf001-b206e.firebaseapp.com",
  projectId: "upf001-b206e",
  storageBucket: "upf001-b206e.firebasestorage.app",
  messagingSenderId: "1069109570044",
  appId: "1:1069109570044:web:0cade93c4ecbc10d08ea79",
  measurementId: "G-Q8VWB9BW0H",
};

const app = initializeApp(firebaseConfig);

// ✅ FIX: ลบ getAnalytics ออก — crash บน React Native (ใช้ได้เฉพาะ web)
// import { getAnalytics } from 'firebase/analytics';
// export const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ FIX: ลบ setPersistence(browserLocalPersistence) ออก
// browserLocalPersistence ใช้ได้เฉพาะ web — บน React Native จะ crash

// ─── Register ────────────────────────────────────────────────
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name,
      },
    };
  } catch (error: any) {
    return { success: false, error: translateFirebaseError(error.code) };
  }
};

// ─── Login ────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || email.split('@')[0],
      },
    };
  } catch (error: any) {
    return { success: false, error: translateFirebaseError(error.code) };
  }
};

// ─── Google Sign-In (web popup only) ─────────────────────────
export const signInWithGoogle = async () => {
  try {
    // ✅ FIX: lazy import เพื่อให้ bundle บน native ไม่พัง
    const { signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email?.split('@')[0] || '',
      },
    };
  } catch (error: any) {
    return { success: false, error: translateFirebaseError(error.code) };
  }
};

// ─── Google Sign-In Credential (native expo-auth-session) ────
export const signInWithGoogleCredential = async (
  idToken: string | null,
  accessToken?: string | null,
) => {
  try {
    if (!idToken && !accessToken) throw new Error('Missing tokens');
    const credential = GoogleAuthProvider.credential(
      idToken || undefined,
      accessToken || undefined,
    );
    const result = await signInWithCredential(auth, credential);
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || result.user.email?.split('@')[0] || '',
      },
    };
  } catch (error: any) {
    return { success: false, error: translateFirebaseError(error.code) };
  }
};

// ─── Reset Password ───────────────────────────────────────────
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: translateFirebaseError(error.code) };
  }
};

// ─── Logout ───────────────────────────────────────────────────
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ─── แปล Firebase error code เป็นภาษาไทย ────────────────────
const translateFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':     return 'อีเมลนี้ถูกใช้งานแล้ว';
    case 'auth/invalid-email':            return 'รูปแบบอีเมลไม่ถูกต้อง';
    case 'auth/weak-password':            return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    case 'auth/user-not-found':           return 'ไม่พบบัญชีผู้ใช้นี้';
    case 'auth/wrong-password':           return 'รหัสผ่านไม่ถูกต้อง';
    case 'auth/invalid-credential':       return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    case 'auth/too-many-requests':        return 'พยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่';
    case 'auth/network-request-failed':   return 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต';
    default:                              return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
  }
};