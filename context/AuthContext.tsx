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
  
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const userDataString = await SecureStore.getItemAsync("userData");

        setUserToken(token);
        if (userDataString) {
          setUser(JSON.parse(userDataString));
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
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
      router.replace("/(tabs)");
    } else if (!userToken && !inAuthGroup) {
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
      console.error("Logout API call failed:", error);
      // Still logout locally even if API call fails
    } finally {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userName");
      await SecureStore.deleteItemAsync("userData");
      setUserToken(null);
      setUser(null);
      router.replace("/(auth)/logIn");
    }
  };

  return (
    <AuthContext.Provider
      // 👉 Export `user` and `setUser` so ChatScreen and LogIn can access them
      value={{ userToken, setUserToken, user, setUser, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}