import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        setUserToken(token);
      } catch (error) {
        console.error("Error loading token:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return;

    // 👉 1. Check where the user currently is
    const inAuthGroup = segments[0] === "(auth)";
    const isAtRoot = !segments[0]; // Are they just opening the app?

    // 👉 2. Route them safely
    if (userToken && (inAuthGroup || isAtRoot)) {
      // If logged in AND at the login screen OR starting the app -> Send Home
      router.replace("/(tabs)");
    } else if (!userToken && !inAuthGroup) {
      // If NOT logged in AND trying to view protected screens -> Send to Login
      router.replace("/(auth)/logIn");
    }
  }, [userToken, segments, isLoading, rootNavigationState, router]);

  const logout = async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userName");
    setUserToken(null);
    router.replace("/(auth)/logIn");
  };

  return (
    <AuthContext.Provider
      value={{ userToken, setUserToken, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}