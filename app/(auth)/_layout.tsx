import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Matches logIn.tsx and signUp.tsx in your directory.
        Make sure the 'name' exactly matches your file names!
      */}
      <Stack.Screen name="logIn" />
      <Stack.Screen name="signUp" />
    </Stack>
  );
}
