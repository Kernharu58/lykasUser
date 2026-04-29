import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("appTheme");
        setColorScheme(savedTheme === "dark" ? "dark" : "light");
      } catch {
        setColorScheme("light");
      }
    };

    loadThemePreference();
  }, [setColorScheme]);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pets/[id]" />
        <Stack.Screen name="appointments/index" />
        <Stack.Screen name="+not-found" options={{ presentation: "modal" }} />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="my-pets" />
        
        {/* 👉 Add this line right here! */}
        <Stack.Screen name="donate" options={{ presentation: "modal" }} /> 
      </Stack>
    </AuthProvider>
  );
}
