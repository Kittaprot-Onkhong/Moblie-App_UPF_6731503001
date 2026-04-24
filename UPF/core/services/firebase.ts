// core/services/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  increment,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  
} from 'firebase/storage';

// ─── Firebase Config ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyDDKwfrZaVrVReYIinl3kDghG3BRP71ykE',
  authDomain:        'upf001-b206e.firebaseapp.com',
  projectId:         'upf001-b206e',
  storageBucket:     'upf001-b206e.firebasestorage.app',
  messagingSenderId: '1069109570044',
  appId:             '1:1069109570044:web:71f86134ff2da32c08ea79',
  measurementId:     'G-LP7NEEYDJE',
};

// ─── Init (ป้องกัน init ซ้ำ) ──────────────────────────────────
const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db   = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

// ─── Types ────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;           // URL รูปโปรไฟล์
  memberSince: string;      // วันที่สมัคร (ISO string)
  scannedProducts: number;
  favoriteProducts: number;
  favorites: string[];      // รายการอาหารโปรด
  healthScore: number;
  healthGoal: string;       // เป้าหมายสุขภาพ (ข้อความ)
  appRating: number;        // คะแนนให้แอพ (1–5)
  appReview: string;        // รีวิวแอพ
}

// ─── Helper: แปลง Firebase Error เป็น message ภาษาไทย ──────
const parseError = (err: any): string => {
  const code = err?.code ?? '';
  const map: Record<string, string> = {
    'auth/email-already-in-use':   'อีเมลนี้ถูกใช้งานแล้ว',
    'auth/invalid-email':          'รูปแบบอีเมลไม่ถูกต้อง',
    'auth/weak-password':          'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'auth/user-not-found':         'ไม่พบอีเมลนี้ในระบบ',
    'auth/wrong-password':         'รหัสผ่านไม่ถูกต้อง',
    'auth/invalid-credential':     'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'auth/too-many-requests':      'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
    'auth/network-request-failed': 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
  };
  return map[code] ?? (err?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่');
};

// ═══════════════════════════════════════════════════════════════
//  AUTH FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ─── Register ────────────────────────────────────────────────
export const registerUser = async (
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    const now  = new Date().toISOString();

    const profile: UserProfile = {
      uid,
      name,
      email,
      avatar:          '',
      memberSince:     now,
      scannedProducts: 0,
      favoriteProducts: 0,
      favorites:       [],
      healthScore:     0,
      healthGoal:      '',
      appRating:       0,
      appReview:       '',
    };

    // บันทึกลง Firestore collection "users" / document = uid
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });

    return { success: true, user: profile };
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

// ─── Login (ตรวจจาก Firebase Auth — ปลอดภัยที่สุด) ──────────
export const loginUser = async (
  email: string,
  password: string,
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;

    // ดึง profile จาก Firestore
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      // มี auth account แต่ยังไม่มี profile (กรณีพิเศษ) → สร้างใหม่
      const profile: UserProfile = {
        uid, name: email.split('@')[0], email,
        avatar: '', memberSince: new Date().toISOString(),
        scannedProducts: 0, favoriteProducts: 0, favorites: [],
        healthScore: 0, healthGoal: '', appRating: 0, appReview: '',
      };
      await setDoc(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() });
      return { success: true, user: profile };
    }

    return { success: true, user: snap.data() as UserProfile };
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

// ─── Google Sign-In (Web popup) ───────────────────────────────
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const provider = new GoogleAuthProvider();
    const cred     = await signInWithPopup(auth, provider);
    return await _upsertGoogleUser(cred.user);
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

// ─── Google Sign-In (Native — credential) ────────────────────
export const signInWithGoogleCredential = async (
  idToken: string | null,
  accessToken: string | null,
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const cred       = await signInWithCredential(auth, credential);
    return await _upsertGoogleUser(cred.user);
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

// helper — upsert Google user ใน Firestore
const _upsertGoogleUser = async (fbUser: User): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  const uid  = fbUser.uid;
  const snap = await getDoc(doc(db, 'users', uid));

  if (snap.exists()) {
    return { success: true, user: snap.data() as UserProfile };
  }

  const profile: UserProfile = {
    uid, name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
    email: fbUser.email ?? '',
    avatar: fbUser.photoURL ?? '',
    memberSince: new Date().toISOString(),
    scannedProducts: 0, favoriteProducts: 0, favorites: [],
    healthScore: 0, healthGoal: '', appRating: 0, appReview: '',
  };
  await setDoc(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() });
  return { success: true, user: profile };
};

// ─── Logout ───────────────────────────────────────────────────
export const logoutUser = async () => {
  await signOut(auth);
};

// ─── Reset Password (ส่งลิงก์ไปที่ email) ───────────────────
export const resetPassword = async (
  email: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

// ─── Auth State Observer (ใช้ใน App.tsx เพื่อ persistent login) ──
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ─── Get current user profile from Firestore ─────────────────
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════
//  PROFILE UPDATE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ─── Upload Profile Photo ─────────────────────────────────────
export const uploadProfilePhoto = async (
  uid: string,
  uri: string, // local file URI จาก image picker
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const response = await fetch(uri);
    const blob     = await response.blob();
    const storageRef = ref(storage, `profile_photos/${uid}/avatar.jpg`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', uid), { avatar: url });
    return { success: true, url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// ─── Update Health Goal ───────────────────────────────────────
export const updateHealthGoal = async (uid: string, goal: string) => {
  await updateDoc(doc(db, 'users', uid), { healthGoal: goal });
};

// ─── Add Favorite Food ────────────────────────────────────────
export const addFavoriteFood = async (uid: string, foodName: string) => {
  await updateDoc(doc(db, 'users', uid), {
  favorites:        arrayUnion(foodName),
  favoriteProducts: increment(1),   // ← ใช้ Firestore increment() ดีที่สุด!
});
};



// ─── Submit App Rating + Review ──────────────────────────────
export const submitAppRating = async (uid: string, rating: number, review: string) => {
  await updateDoc(doc(db, 'users', uid), { appRating: rating, appReview: review });
};

// ─── Submit Bug Report (with multiple images) ────────────────
// เก็บลงใน collection "reports" / sub-document
export const submitBugReport = async (
  uid: string,
  message: string,
  imageUris: string[], // local URIs
): Promise<{ success: boolean; error?: string }> => {
  try {
    // อัปโหลดรูปทีละรูป
    const imageUrls: string[] = [];
    for (let i = 0; i < imageUris.length; i++) {
      const response  = await fetch(imageUris[i]);
      const blob      = await response.blob();
      const storageRef = ref(storage, `reports/${uid}/${Date.now()}_${i}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }

    // บันทึก report ลง Firestore
    await addDoc(collection(db, 'reports'), {
      uid,
      message,
      imageUrls,
      createdAt: serverTimestamp(),
      status: 'pending',
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// ─── Update Scanned Products Count ───────────────────────────
export const incrementScanCount = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    await updateDoc(doc(db, 'users', uid), {
      scannedProducts: (snap.data().scannedProducts ?? 0) + 1,
    });
  }
};