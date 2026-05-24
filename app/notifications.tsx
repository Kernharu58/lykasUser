import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const notifications = [
  { title: "Application update", body: "Emma's application is now under review.", time: "10 min ago", icon: "clipboard-outline", unread: true },
  { title: "Event reminder", body: "Adoption Drive starts tomorrow at 9AM.", time: "2 hr ago", icon: "calendar-outline", unread: true },
  { title: "Health reminder", body: "Upload Luna's latest vaccination record.", time: "Yesterday", icon: "medkit-outline", unread: false },
];

export default function Notifications() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color="#D4622A" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#2C2C2C] dark:text-white">Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 80 }}>
        <View className="gap-3">
          {notifications.map((item) => (
            <View key={item.title} className={`rounded-3xl border bg-white p-4 shadow-sm dark:bg-gray-800 ${item.unread ? "border-[#D4622A]" : "border-[#E8E4DC] dark:border-gray-700"}`}>
              <View className="flex-row items-start">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5EDD6]">
                  <Ionicons name={item.icon as any} size={22} color="#D4622A" />
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-extrabold text-[#2C2C2C] dark:text-white">{item.title}</Text>
                    {item.unread && <View className="h-2.5 w-2.5 rounded-full bg-[#D4622A]" />}
                  </View>
                  <Text className="mt-1 text-sm leading-5 text-[#7A7068] dark:text-gray-400">{item.body}</Text>
                  <Text className="mt-2 text-xs font-bold text-[#B0A898]">{item.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
