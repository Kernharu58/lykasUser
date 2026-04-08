import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: isDark ? "#4ade80" : "#2D6A4F",
        tabBarInactiveTintColor: isDark ? "#6b7280" : "#AAAAAA",
        headerShown: false,

        // 🌟 Floating Tab Bar Styling 🌟
        tabBarStyle: {
          // 👉 1. Dimensions and Positioning
          height: Platform.OS === "ios" ? 80 : 70,
          position: "absolute", // Detach from the bottom of the screen

          // 👉 2. Floating Spacing
          bottom: 55, // Set to 8 pixels from the bottom edge
          left: 30, // Margin from left
          right: 30, // Margin from right

          // 👉 3. Shape and Visuals
          borderRadius: 40, // Rounded edges
          backgroundColor: isDark ? "#111827" : "#FFFFFF",
          borderTopWidth: 0, // Remove the default line

          // 👉 4. Padding for Icons/Labels
          paddingBottom: Platform.OS === "ios" ? 25 : 12,
          paddingTop: 12,

          // 👉 5. Elevation and Shadow (Creates the "float" effect)
          elevation: 8, // Android shadow
          shadowColor: "#000", // iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: -1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adopt"
        options={{
          title: "Adopt",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "paw" : "paw-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
