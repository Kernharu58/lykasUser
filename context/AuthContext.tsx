import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from '@/utils/api';

// FIX (Critical #6): Typed user interface instead of `any`
interface AuthUser {
  id?: string;
  _id?: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin' | 'staff' | 'super_admin';
  profilePicture?: string;
  status?: 'active' | 'suspended' | 'locked';
  emailVerified?: boolean;
}

interface AuthContextType {
  userToken: string | null;
  setUserToken: (token: string | null) => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  tokenSyncError: string | null;
}

// FIX (Critical #6): Typed context (no longer `any`)
const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
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

        if (token) {
          setUserToken(token);
        }

        if (userDataString) {
          try {
            setUser(JSON.parse(userDataString) as AuthUser);
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
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isAtRoot = !segments[0];
    const isTabsGroup = segments[0] === "(tabs)";

    if (userToken && !isTabsGroup && (inAuthGroup || isAtRoot)) {
      router.replace("/(tabs)");
    } else if (!userToken && !inAuthGroup) {
      router.replace("/(auth)/logIn");
    }
  }, [userToken, segments, isLoading, rootNavigationState?.key, router]);

  const logout = async () => {
    try {
      if (userToken) {
        await api.post('/auth/logout').catch(err => {
          console.warn("[AuthContext] Logout API call failed:", err.message);
        });
      }
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
    } finally {
      try {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userName");
        await SecureStore.deleteItemAsync("userData");
      } catch (err) {
        console.error("[AuthContext] Error deleting from SecureStore:", err);
      }

      try {
        if (GoogleSignin.hasPreviousSignIn()) {
          await GoogleSignin.signOut();
        }
      } catch (err) {
        console.warn("[AuthContext] Google sign-out failed:", err);
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