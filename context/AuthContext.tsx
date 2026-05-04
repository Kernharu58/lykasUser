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

  // 👉 FIX: Initialize token from SecureStore on app start
  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const userDataString = await SecureStore.getItemAsync("userData");

        console.log(`[AuthContext] Token loaded from SecureStore: ${token ? "✅ Present" : "❌ Missing"}`);
        
        // Set token first, then user data
        if (token) {
          setUserToken(token);
        }
        
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

  // 👉 FIX: Improved routing logic with better state management
  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isAtRoot = !segments[0];
    const isTabsGroup = segments[0] === "(tabs)";

    console.log(`[AuthContext] Routing check - Token: ${userToken ? "✅" : "❌"}, Segment: ${segments[0] || "root"}, Loading: ${isLoading}`);

    // User has token and is trying to access auth screens - redirect to tabs
    if (userToken && !isTabsGroup && (inAuthGroup || isAtRoot)) {
      console.log("[AuthContext] User authenticated, routing to tabs");
      router.replace("/(tabs)");
    } 
    // User has no token and is trying to access protected screens - redirect to login
    else if (!userToken && !inAuthGroup) {
      console.log("[AuthContext] No token found, routing to login");
      router.replace("/(auth)/logIn");
    }
  }, [userToken, segments, isLoading, rootNavigationState?.key, router]);

  const logout = async () => {
    try {
      // Call backend to blacklist the token
      if (userToken) {
        await api.post('/auth/logout').catch(err => {
          console.warn("[AuthContext] Logout API call failed:", err.message);
          // Don't throw - we still want to logout locally
        });
      }
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
      // Continue with local logout anyway
    } finally {
      try {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userName");
        await SecureStore.deleteItemAsync("userData");
      } catch (err) {
        console.error("[AuthContext] Error deleting from SecureStore:", err);
      }
      
      setUserToken(null);
      setUser(null);
      setTokenSyncError(null);
      router.replace("/(auth)/logIn");
    }
  };

  return (
    <AuthContext.Provider
      value={{ userToken, setUserToken, user, setUser, logout, isLoading, tokenSyncError }}
    >
      {children}
    </AuthContext.Provider>
  );
}