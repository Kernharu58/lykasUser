import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from '@/utils/api';

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenSyncError, setTokenSyncError] = useState<string | null>(null);
  
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const userDataString = await SecureStore.getItemAsync("userData");

        console.log(`[AuthContext] Token loaded from SecureStore: ${token ? "✅ Present" : "❌ Missing"}`);
        
        setUserToken(token);
        if (userDataString) {
          try {
            setUser(JSON.parse(userDataString));
          } catch (parseError) {
            console.error("[AuthContext] Failed to parse userData:", parseError);
            setTokenSyncError("Failed to parse user data");
          }
        }
      } catch (error) {
        console.error("[AuthContext] Error loading auth data:", error);
        setTokenSyncError(String(error));
      } finally {
        setIsLoading(false);
      }
    };
    loadTokenAndUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isAtRoot = !segments[0];

    if (userToken && (inAuthGroup || isAtRoot)) {
      console.log("[AuthContext] User authenticated, routing to tabs");
      router.replace("/(tabs)");
    } else if (!userToken && !inAuthGroup) {
      console.log("[AuthContext] No token found, routing to login");
      router.replace("/(auth)/logIn");
    }
  }, [userToken, segments, isLoading, rootNavigationState, router]);

  const logout = async () => {
    try {
      // Call backend to blacklist the token
      if (userToken) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error("[AuthContext] Logout API call failed:", error);
      // Still logout locally even if API call fails
    } finally {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userName");
      await SecureStore.deleteItemAsync("userData");
      setUserToken(null);
      setUser(null);
      setTokenSyncError(null);
      router.replace("/(auth)/logIn");
    }
  };

  return (
    <AuthContext.Provider
      // 👉 Export `user` and `setUser` so ChatScreen and LogIn can access users
      value={{ userToken, setUserToken, user, setUser, logout, isLoading, tokenSyncError }}
    >
      {children}
    </AuthContext.Provider>
  );
}