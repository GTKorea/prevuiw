"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, queryKeys } from "@/shared/api";
import { getToken } from "@/shared/lib";
import { useAuthStore } from "./store";
import type { User } from "@/shared/types";

export function useAuth() {
  const { user, isLoading, setUser, logout } = useAuthStore();

  const { data, isLoading: queryLoading } = useQuery<User>({
    queryKey: queryKeys.auth.me(),
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
