import { create } from "zustand";
import type { User } from "@/db/types";

// User without password hash for client-side usage
export type SafeUser = Omit<User, "passwordHash">;

interface AuthState {
  // Current user
  user: SafeUser | null;
  setUser: (user: SafeUser | null) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Initialization state
  isInitialized: boolean;
  setIsInitialized: (initialized: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  isLoading: true,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
