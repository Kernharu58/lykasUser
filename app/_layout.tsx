import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-xl font-bold text-darkBlue text-center">Something went wrong</Text>
      <Text className="text-neutral text-center mt-2">{error.message || "Please try again."}</Text>
      <TouchableOpacity className="mt-6 rounded-xl bg-primary px-5 py-3" onPress={retry}>
        <Text className="font-bold text-white">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

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
