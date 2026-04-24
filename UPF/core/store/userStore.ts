// core/store/userStore.ts
import { create } from 'zustand';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  scannedProducts: number;
  favoriteProducts: number;
  favorites: string[];
  healthScore: number;
  healthGoal: string;
  appRating: number;
  appReview: string;
}

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  isFavorite: (name: string) => boolean;
  incrementScans: () => void;
  updateHealthScore: (score: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,

  // ✅ simple set — ไม่ trigger loop
  setUser: (user) => set({ user }),

  // ✅ clear user เมื่อ logout
  clearUser: () => set({ user: null }),

  // ✅ เช็คว่า foodName อยู่ใน favorites หรือไม่
  isFavorite: (name) => {
    const favs = get().user?.favorites ?? [];
    return favs.includes(name);
  },

  // ✅ เพิ่ม scanned count ใน local store
  incrementScans: () => {
    const u = get().user;
    if (!u) return;
    set({ user: { ...u, scannedProducts: (u.scannedProducts ?? 0) + 1 } });
  },

  // ✅ อัปเดต health score
  updateHealthScore: (score) => {
    const u = get().user;
    if (!u) return;
    set({ user: { ...u, healthScore: score } });
  },
}));