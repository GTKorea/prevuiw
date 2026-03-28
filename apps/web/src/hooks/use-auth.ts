"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { getToken } from "@/lib/auth";
import { useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export function useAuth() {
  const { user, isLoading, setUser, logout } = useAuthStore();

  const { data, isLoading: queryLoading } = useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: () => api.get<User>("/auth/me"),
    enabled: !!getToken(),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (!queryLoading && !data) {
      setUser(null);
    }
  }, [data, queryLoading, setUser]);

  return {
    user,
    isLoading: isLoading && queryLoading,
    isAuthenticated: !!user,
    logout,
  };
}
