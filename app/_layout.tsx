import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-xl font-bold text-darkBlue text-center">
        Something went wrong
      </Text>
      <Text className="text-neutral text-center mt-2">
        {error.message || "Please try again."}
      </Text>
      <TouchableOpacity
        className="mt-6 rounded-xl bg-primary px-5 py-3"
        onPress={retry}
      >
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
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: "fade", animationDuration: 350 }}
        />
        <Stack.Screen name="pets/[id]" />
        <Stack.Screen name="pets/apply/[id]" />
        <Stack.Screen name="appointments/index" />
        <Stack.Screen name="appointments/apply/[id]" />
        <Stack.Screen name="application-details/[id]" />
        <Stack.Screen name="foster-dashboard" />
        <Stack.Screen name="monitoring-report" />
        <Stack.Screen name="health/[petId]" />
        <Stack.Screen name="baby-book/[petId]" />
        <Stack.Screen name="foster/[petId]" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="payment/success" />
        <Stack.Screen name="payment/cancel" />
        <Stack.Screen name="volunteer-portal" />
        <Stack.Screen name="compare-pets" />
        <Stack.Screen name="emergency-report" />
        <Stack.Screen name="my-appointments" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="my-pets" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="donate" options={{ presentation: "modal" }} />
        <Stack.Screen name="donate-goods" options={{ presentation: "modal" }} />
        {/* ✅ Bug 2 fix */}
        <Stack.Screen name="+not-found" options={{ presentation: "modal" }} />
      </Stack>
    </AuthProvider>
  );
}
