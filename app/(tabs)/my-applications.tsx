import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const applications = [
  { id: "CPW-2026-014", pet: "Emma", type: "Adoption", step: "Home visit scheduling", progress: 68, status: "Under Review" },
  { id: "CPW-2026-018", pet: "Milo", type: "Foster", step: "Staff review", progress: 42, status: "Pending" },
];

export default function MyApplications() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
        <View className="mt-4 mb-6">
          <Text className="text-3xl font-extrabold text-[#111827] dark:text-white">My Applications</Text>
          <Text className="text-[#6B7280] dark:text-gray-400 mt-2">Transparent status tracking from submission to decision.</Text>
        </View>

        <View className="gap-4">
          {applications.map((application) => (
            <View key={application.id} className="rounded-3xl border border-[#DCE8E1] bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-xs font-bold uppercase tracking-widest text-[#B0A898]">{application.id}</Text>
                  <Text className="mt-2 text-xl font-extrabold text-[#111827] dark:text-white">{application.pet}</Text>
                  <Text className="text-sm text-[#6B7280] dark:text-gray-400">{application.type} application</Text>
                </View>
                <View className="rounded-full bg-[#FEF3E2] px-3 py-1">
                  <Text className="text-xs font-bold text-[#E8A020]">{application.status}</Text>
                </View>
              </View>

              <View className="mt-5">
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-sm font-bold text-[#111827] dark:text-white">{application.step}</Text>
                  <Text className="text-sm font-bold text-[#1E6B45]">{application.progress}%</Text>
                </View>
                <View className="h-3 rounded-full bg-[#F4F2EE] dark:bg-gray-700">
                  <View className="h-3 rounded-full bg-[#1E6B45]" style={{ width: `${application.progress}%` }} />
                </View>
              </View>

              <View className="mt-5 flex-row items-center rounded-2xl bg-[#EAF4EE] p-3">
                <Ionicons name="information-circle" size={20} color="#1E6B45" />
                <Text className="ml-2 flex-1 text-sm font-medium text-[#3D3830]">We will notify you when the next action is ready.</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

