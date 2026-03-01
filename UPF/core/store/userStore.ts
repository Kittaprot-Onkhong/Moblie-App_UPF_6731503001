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
  favorites: string[]; // product IDs
  setUser: (user: User) => void;
  logout: () => void;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  incrementScans: () => void;
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  favorites: [],
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, favorites: [] }),
  addFavorite: (productId) =>
    set((state) => ({
      favorites: [...state.favorites, productId],
      user: state.user
        ? { ...state.user, favoriteProducts: (state.user.favoriteProducts || 0) + 1 }
        : null,
    })),
  removeFavorite: (productId) =>
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== productId),
      user: state.user
        ? { ...state.user, favoriteProducts: Math.max(0, (state.user.favoriteProducts || 1) - 1) }
        : null,
    })),
  isFavorite: (productId) => get().favorites.includes(productId),
  incrementScans: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, scannedProducts: (state.user.scannedProducts || 0) + 1 }
        : null,
    })),
}));
