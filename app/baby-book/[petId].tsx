import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const timeline = [
  { date: "June 1", title: "Vaccination", detail: "DHPP booster completed." },
  { date: "June 10", title: "Vet Visit", detail: "Healthy weight gain and clear appetite." },
  { date: "June 20", title: "Weight Update", detail: "Reached 8.4 kg." },
  { date: "June 25", title: "Photo Upload", detail: "New home gallery updated." },
];

const vaccines = [
  { name: "Rabies", status: "Due soon", date: "Mar 2026" },
  { name: "DHPP", status: "Current", date: "Jan 2026" },
];

export default function BabyBook() {
  const router = useRouter();
  const { petId } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color="#D4622A" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-[#2C2C2C] dark:text-white">Baby Book</Text>
          <Text className="text-xs font-bold text-[#B0A898]">Pet ID: {petId}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 90 }}>
        <View className="rounded-3xl bg-[#D4622A] p-5">
          <Text className="text-2xl font-extrabold text-white">Pet Baby Book</Text>
          <Text className="mt-2 text-sm leading-5 text-white/90">A memory timeline for health, milestones, photos, and shelter follow-ups.</Text>
        </View>

        <View className="mt-5 flex-row gap-3">
          {["Photos", "Milestones", "Highlights"].map((item) => (
            <View key={item} className="flex-1 rounded-3xl bg-white p-4 border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
              <Ionicons name={item === "Photos" ? "images-outline" : item === "Milestones" ? "ribbon-outline" : "sparkles-outline"} size={24} color="#D4622A" />
              <Text className="mt-2 text-xs font-extrabold text-[#2C2C2C] dark:text-white">{item}</Text>
            </View>
          ))}
        </View>

        <Text className="mt-7 mb-3 text-xl font-extrabold text-[#2C2C2C] dark:text-white">Timeline</Text>
        <View className="gap-3">
          {timeline.map((item) => (
            <View key={item.title} className="rounded-3xl bg-white p-4 border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
              <Text className="text-xs font-bold uppercase tracking-widest text-[#D4622A]">{item.date}</Text>
              <Text className="mt-2 font-extrabold text-[#2C2C2C] dark:text-white">{item.title}</Text>
              <Text className="mt-1 text-sm text-[#7A7068] dark:text-gray-400">{item.detail}</Text>
            </View>
          ))}
        </View>

        <Text className="mt-7 mb-3 text-xl font-extrabold text-[#2C2C2C] dark:text-white">Vaccinations</Text>
        <View className="gap-3">
          {vaccines.map((item) => (
            <View key={item.name} className="flex-row items-center rounded-3xl bg-white p-4 border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5EDD6]"><Ionicons name="medical" size={22} color="#D4622A" /></View>
              <View className="ml-4 flex-1">
                <Text className="font-extrabold text-[#2C2C2C] dark:text-white">{item.name}</Text>
                <Text className="text-sm text-[#7A7068] dark:text-gray-400">{item.date}</Text>
              </View>
              <Text className={`font-bold ${item.status === "Current" ? "text-[#3D8A5E]" : "text-[#E8A020]"}`}>{item.status}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity className="mt-6 rounded-2xl bg-[#D4622A] py-4" onPress={() => router.push(`/health/${petId}` as any)}>
          <Text className="text-center font-extrabold text-white">Open Health Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3 rounded-2xl border border-[#D4622A] py-4" onPress={() => router.push("/monitoring-report" as any)}>
          <Text className="text-center font-extrabold text-[#D4622A]">Report Health Update</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
