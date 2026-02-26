import { create } from 'zustand';

type User = {
  name: string;
  email: string;
  avatar?: string;
  memberSince?: string;
  scannedProducts?: number;
  favoriteProducts?: number;
  healthScore?: number;
};

type UserState = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
