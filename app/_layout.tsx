import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

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
        
        {/* 👉 Add this line right here! */}
        <Stack.Screen name="donate" options={{ presentation: "modal" }} /> 
      </Stack>
    </AuthProvider>
  );
}