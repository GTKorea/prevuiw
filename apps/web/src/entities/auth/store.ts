"use client";
import { create } from "zustand";
import type { User } from "@/shared/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("prevuiw_token");
    }
    set({ user: null, isLoading: false });
  },
}));
