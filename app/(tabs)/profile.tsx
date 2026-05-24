import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const sections = [
  { title: "My Applications", subtitle: "Track adoption and foster reviews", icon: "clipboard-outline", path: "/(tabs)/my-applications" },
  { title: "My Pets", subtitle: "Baby book and health updates", icon: "paw-outline", path: "/my-pets" },
  { title: "Saved Pets", subtitle: "Pets you want to revisit", icon: "heart-outline", path: "/(tabs)/favorites" },
  { title: "Donation History", subtitle: "Receipts and past gifts", icon: "receipt-outline", path: "/donate" },
  { title: "Messages", subtitle: "Chat with shelter staff", icon: "chatbubbles-outline", path: "/(tabs)/chat" },
  { title: "Notification Settings", subtitle: "Push, email, and reminders", icon: "notifications-outline", path: "/(tabs)/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const initial = user?.displayName?.charAt(0)?.toUpperCase() || "C";

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="mt-4 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#1E6B45] shadow-sm">
            <Text className="text-4xl font-extrabold text-white">{initial}</Text>
          </View>
          <Text className="mt-4 text-2xl font-extrabold text-[#111827] dark:text-white">{user?.displayName || "CarePaws User"}</Text>
          <Text className="mt-1 text-sm font-medium text-[#6B7280] dark:text-gray-400">{user?.email || "pet.parent@carepaws.app"}</Text>
          <View className="mt-3 rounded-full bg-[#E8F5EE] px-3 py-1">
            <Text className="text-xs font-bold text-[#3D8A5E]">Verified pet parent</Text>
          </View>
        </View>

        <View className="mt-8 rounded-3xl bg-white p-5 shadow-sm border border-[#DCE8E1] dark:bg-gray-800 dark:border-gray-700">
          <Text className="text-lg font-extrabold text-[#111827] dark:text-white">Care progress</Text>
          <View className="mt-4 flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-extrabold text-[#1E6B45]">2</Text>
              <Text className="text-xs font-bold text-[#6B7280]">Applications</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-extrabold text-[#1E6B45]">4</Text>
              <Text className="text-xs font-bold text-[#6B7280]">Saved</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-extrabold text-[#1E6B45]">1</Text>
              <Text className="text-xs font-bold text-[#6B7280]">Events</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 gap-3">
          {sections.map((item) => (
            <TouchableOpacity key={item.title} className="flex-row items-center rounded-3xl bg-white p-4 border border-[#DCE8E1] dark:bg-gray-800 dark:border-gray-700" onPress={() => router.push(item.path as any)}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EAF4EE]">
                <Ionicons name={item.icon as any} size={22} color="#1E6B45" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-extrabold text-[#111827] dark:text-white">{item.title}</Text>
                <Text className="text-sm text-[#6B7280] dark:text-gray-400">{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B0A898" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="mt-6 rounded-2xl border border-red-100 bg-red-50 py-4 dark:bg-red-900/20 dark:border-red-900/30" onPress={logout}>
          <Text className="text-center font-extrabold text-red-500">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

