import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const rows = [
  ["Age", "2 yrs", "1 yr"],
  ["Breed", "Golden Retriever", "Persian Cat"],
  ["Size", "Large", "Small"],
  ["Gender", "Female", "Female"],
  ["Vaccination", "Current", "Due soon"],
];

export default function ComparePets() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#111827] dark:text-white">Compare Pets</Text>
      </View>
      <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        <View className="min-w-[360px] rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
          <View className="flex-row border-b border-[#DCE8E1] pb-3">
            <Text className="w-28 font-extrabold text-[#6B7280]">Feature</Text>
            <Text className="w-32 font-extrabold text-[#111827] dark:text-white">Emma</Text>
            <Text className="w-32 font-extrabold text-[#111827] dark:text-white">Luna</Text>
          </View>
          {rows.map(([feature, emma, luna]) => (
            <View key={feature} className="flex-row border-b border-[#F3F4F6] py-4">
              <Text className="w-28 font-bold text-[#6B7280]">{feature}</Text>
              <Text className="w-32 font-extrabold text-[#111827] dark:text-white">{emma}</Text>
              <Text className="w-32 font-extrabold text-[#111827] dark:text-white">{luna}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
