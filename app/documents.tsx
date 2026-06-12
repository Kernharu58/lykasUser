import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const documents = [
  ["Valid ID", "Verified", "checkmark-circle", "#1E6B45"],
  ["Proof of Address", "Pending Review", "time", "#E8A020"],
  ["House Photos", "Rejected", "close-circle", "#EF4444"],
];

export default function Documents() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#111827] dark:text-white">My Documents</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        <View className="gap-3">
          {documents.map(([title, status, icon, color]) => (
            <View key={title} className="flex-row items-center rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EAF4EE]">
                <Ionicons name={icon as any} size={24} color={color} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-extrabold text-[#111827] dark:text-white">{title}</Text>
                <Text className="text-sm font-bold" style={{ color }}>{status}</Text>
              </View>
              <TouchableOpacity className="rounded-xl border border-[#DCE8E1] px-3 py-2">
                <Text className="font-extrabold text-[#1E6B45]">{status === "Rejected" ? "Replace" : "View"}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
