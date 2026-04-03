import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const AuthContext = createContext<any>(null);

// Custom hook to use the auth context easily
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // 1. Check for the token when the app first loads
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setUserToken(token);
      } catch (error) {
        console.error("Error loading token:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  // 2. Route the user based on whether they have a token
  useEffect(() => {
    if (isLoading) return; // Don't do anything while checking storage

    // Check if the user is currently in the (auth) group
    const inAuthGroup = segments[0] === "(auth)";

    if (userToken && inAuthGroup) {
      // If they are logged in but trying to view the login screen, send them Home
      router.replace("/(tabs)");
    } else if (!userToken && !inAuthGroup) {
      // If they are NOT logged in but trying to view the tabs, send them to Login
      router.replace("/(auth)/logIn");
    }
  }, [userToken, segments, isLoading]);

  // 3. Create a real Logout function
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userName");
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
