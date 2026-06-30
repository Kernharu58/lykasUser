import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Platform } from "react-native";
import { COLORS } from "../../utils/colors";

const GREEN = COLORS.primary;
const GREEN_DARK = COLORS.green900;
const MUTED = COLORS.mutedLight;

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: isDark ? COLORS.green400 : GREEN,
        tabBarInactiveTintColor: isDark ? COLORS.muted : MUTED,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 22,
          right: 22,
          bottom: Platform.OS === "ios" ? 22 : 12,
          height: Platform.OS === "ios" ? 78 : 70,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 22 : 15,
          borderRadius: 34,
          backgroundColor: isDark ? COLORS.ink : COLORS.white,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? COLORS.slateDark : COLORS.gray200,
          elevation: 14,
          shadowColor: GREEN_DARK,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.16,
          shadowRadius: 18,
        },
        tabBarItemStyle: {
          borderRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -1,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="adopt" options={{ title: "Pets", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "paw" : "paw-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="my-applications" options={{ title: "Applications", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "clipboard" : "clipboard-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: "Messages", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
