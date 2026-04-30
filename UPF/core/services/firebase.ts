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

// ─── Init ─────────────────────────────────────────────────────
const app     = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

// ─── Types ────────────────────────────────────────────────────
export interface UserProfile {
  uid:              string;
  name:             string;
  email:            string;
  avatar:           string;
  memberSince:      string;
  scannedProducts:  number;
  favoriteProducts: number;
  favorites:        string[];
  healthScore:      number;
  healthGoal:       string;
  appRating:        number;
  appReview:        string;
  eatHistory?:      Record<string, any[]>;   // eatHistory.YYYY-MM-DD = []
  [key: string]:    any;                     // ← รองรับ dynamic field เช่น healthScore_2025-01-01
}

// ─── Helper ───────────────────────────────────────────────────
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
//  AUTH
// ═══════════════════════════════════════════════════════════════

export const registerUser = async (
  email: string, password: string, name: string,
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    const now  = new Date().toISOString();

    const profile: UserProfile = {
      uid, name, email,
      avatar: '', memberSince: now,
      scannedProducts: 0, favoriteProducts: 0, favorites: [],
      healthScore: 0, healthGoal: '', appRating: 0, appReview: '',
      eatHistory: {},
    };

    await setDoc(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() });
    return { success: true, user: profile };
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

export const loginUser = async (
  email: string, password: string,
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    const snap = await getDoc(doc(db, 'users', uid));

    if (!snap.exists()) {
      const profile: UserProfile = {
        uid, name: email.split('@')[0], email,
        avatar: '', memberSince: new Date().toISOString(),
        scannedProducts: 0, favoriteProducts: 0, favorites: [],
        healthScore: 0, healthGoal: '', appRating: 0, appReview: '',
        eatHistory: {},
      };
      await setDoc(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() });
      return { success: true, user: profile };
    }

    // ✅ คืน raw data ทั้งหมดจาก Firestore รวมถึง dynamic fields
    const rawData = snap.data();
    return { success: true, user: rawData as UserProfile };
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

export const signInWithGoogle = async (): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const provider = new GoogleAuthProvider();
    const cred     = await signInWithPopup(auth, provider);
    return await _upsertGoogleUser(cred.user);
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

export const signInWithGoogleCredential = async (
  idToken: string | null, accessToken: string | null,
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const cred       = await signInWithCredential(auth, credential);
    return await _upsertGoogleUser(cred.user);
  } catch (err: any) {
    return { success: false, error: parseError(err) };
  }
};

const _upsertGoogleUser = async (fbUser: User): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  const uid  = fbUser.uid;
  const snap = await getDoc(doc(db, 'users', uid));

  if (snap.exists()) {
    // ✅ คืน raw data ทั้งหมด
    return { success: true, user: snap.data() as UserProfile };
  }

  const profile: UserProfile = {
    uid, name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
    email: fbUser.email ?? '', avatar: fbUser.photoURL ?? '',
    memberSince: new Date().toISOString(),
    scannedProducts: 0, favoriteProducts: 0, favorites: [],
    healthScore: 0, healthGoal: '', appRating: 0, appReview: '',
    eatHistory: {},
  };
  await setDoc(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() });
  return { success: true, user: profile };
};

export const logoutUser = async () => { await signOut(auth); };

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

export const onAuthChanged = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// ─── getUserProfile ───────────────────────────────────────────
// ✅ แก้หลัก: คืน snap.data() ทั้งหมดโดยไม่ filter
// ทำให้ dynamic fields เช่น healthScore_2025-01-15, eatHistory
// ถูกส่งกลับมาใน store ด้วย พอ restart แล้วคะแนนจึงไม่หาย
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;

    // คืน raw data ทั้งหมด — ไม่ cast เป็น UserProfile ที่มี field จำกัด
    const rawData = snap.data();

    // ✅ ตรวจสอบว่า collection users มีอยู่แล้ว ถ้ายังไม่มีค่าบางอย่างให้ set default
    const profile: UserProfile = {
      uid:              rawData.uid              ?? uid,
      name:             rawData.name             ?? '',
      email:            rawData.email            ?? '',
      avatar:           rawData.avatar           ?? '',
      memberSince:      rawData.memberSince      ?? new Date().toISOString(),
      scannedProducts:  rawData.scannedProducts  ?? 0,
      favoriteProducts: rawData.favoriteProducts ?? 0,
      favorites:        rawData.favorites        ?? [],
      healthScore:      rawData.healthScore      ?? 0,
      healthGoal:       rawData.healthGoal       ?? '',
      appRating:        rawData.appRating        ?? 0,
      appReview:        rawData.appReview        ?? '',
      eatHistory:       rawData.eatHistory       ?? {},
      // ✅ spread raw data ทั้งหมดเพื่อรวม dynamic fields
      // เช่น healthScore_2025-01-15, healthScore_2025-01-16, ...
      ...rawData,
    };

    return profile;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════
//  PROFILE UPDATE
// ═══════════════════════════════════════════════════════════════

export const uploadProfilePhoto = async (
  uid: string, uri: string,
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const response   = await fetch(uri);
    const blob       = await response.blob();
    const storageRef = ref(storage, `profile_photos/${uid}/avatar.jpg`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', uid), { avatar: url });
    return { success: true, url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const updateHealthGoal = async (uid: string, goal: string) => {
  await updateDoc(doc(db, 'users', uid), { healthGoal: goal });
};

export const addFavoriteFood = async (uid: string, foodName: string) => {
  await updateDoc(doc(db, 'users', uid), {
    favorites:        arrayUnion(foodName),
    favoriteProducts: increment(1),
  });
};

export const submitAppRating = async (uid: string, rating: number, review: string) => {
  await updateDoc(doc(db, 'users', uid), { appRating: rating, appReview: review });
};

export const submitBugReport = async (
  uid: string, message: string, imageUris: string[],
): Promise<{ success: boolean; error?: string }> => {
  try {
    const imageUrls: string[] = [];
    for (let i = 0; i < imageUris.length; i++) {
      const response   = await fetch(imageUris[i]);
      const blob       = await response.blob();
      const storageRef = ref(storage, `reports/${uid}/${Date.now()}_${i}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    }
    await addDoc(collection(db, 'reports'), {
      uid, message, imageUrls,
      createdAt: serverTimestamp(),
      status: 'pending',
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const incrementScanCount = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    await updateDoc(doc(db, 'users', uid), {
      scannedProducts: (snap.data().scannedProducts ?? 0) + 1,
    });
  }
};