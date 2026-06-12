import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const cards = [
  ["Vaccinations", "2 current, 1 due soon", "shield-checkmark-outline"],
  ["Vet Visits", "Next visit June 18", "medical-outline"],
  ["Weight History", "8.4 kg, healthy gain", "analytics-outline"],
  ["Medications", "No active medication", "bandage-outline"],
  ["Health Notes", "Appetite normal", "document-text-outline"],
];

export default function HealthOverview() {
  const router = useRouter();
  const { petId } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-[#111827] dark:text-white">Health Overview</Text>
          <Text className="text-xs font-bold text-[#6B7280]">Pet ID: {petId}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        <View className="rounded-3xl bg-[#1E6B45] p-5">
          <Text className="text-sm font-bold text-white/80">Vaccine countdown</Text>
          <Text className="mt-1 text-4xl font-extrabold text-white">12 days</Text>
          <Text className="mt-2 text-white/90">Rabies booster due on June 18, 2026</Text>
        </View>

        <View className="mt-5 flex-row items-end justify-between rounded-3xl border border-[#DCE8E1] bg-white p-5 dark:bg-gray-800 dark:border-gray-700">
          {[45, 52, 58, 64, 72, 78].map((height, index) => (
            <View key={index} className="items-center">
              <View className="w-7 rounded-t-xl bg-[#9DD6B7]" style={{ height }} />
              <Text className="mt-2 text-[10px] font-bold text-[#6B7280]">W{index + 1}</Text>
            </View>
          ))}
        </View>

        <View className="mt-5 flex-row flex-wrap justify-between">
          {cards.map(([title, body, icon]) => (
            <TouchableOpacity key={title} className="mb-3 w-[48%] rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800 dark:border-gray-700" onPress={() => title === "Vaccinations" && router.push(`/baby-book/${petId}` as any)}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EAF4EE]">
                <Ionicons name={icon as any} size={22} color="#1E6B45" />
              </View>
              <Text className="mt-3 font-extrabold text-[#111827] dark:text-white">{title}</Text>
              <Text className="mt-1 text-xs leading-5 text-[#6B7280] dark:text-gray-400">{body}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
