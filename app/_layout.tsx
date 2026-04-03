import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css"; // Required for NativeWind v4 to apply styles
export default function RootLayout() {
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
      </Stack>
    </AuthProvider>
  );
}
