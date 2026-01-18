"use client";

import * as React from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { getCurrentUser } from "@/app/actions/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider initializes the auth state on app load.
 * It fetches the current user from the session cookie and updates the store.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setIsLoading, setIsInitialized, isInitialized } =
    useAuthStore();

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [isInitialized, setUser, setIsLoading, setIsInitialized]);

  return <>{children}</>;
}
