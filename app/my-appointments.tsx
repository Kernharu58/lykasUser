import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const appointments = [
  { title: "Adoption Interview", date: "June 12, 2026 - 10:30 AM", status: "Confirmed", icon: "videocam-outline" },
  { title: "Home Visit", date: "June 16, 2026 - 2:00 PM", status: "Pending", icon: "home-outline" },
];

export default function MyAppointments() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-darkBlue dark:text-white ml-auto mr-auto">Appointments</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        <View className="mb-5 rounded-3xl bg-white p-5 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <Text className="text-lg font-extrabold text-darkBlue dark:text-white">Calendar View</Text>
          <View className="mt-4 flex-row justify-between">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => (
              <View key={day} className={`h-14 w-12 items-center justify-center rounded-2xl ${index === 2 ? "bg-primary" : "bg-green-50 dark:bg-gray-700"}`}>
                <Text className={`text-xs font-bold ${index === 2 ? "text-white" : "text-primary"}`}>{day}</Text>
                <Text className={`font-extrabold ${index === 2 ? "text-white" : "text-darkBlue dark:text-white"}`}>{8 + index}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-5 flex-row gap-3">
          <TouchableOpacity className="flex-1 rounded-2xl bg-primary py-4">
            <Text className="text-center font-extrabold text-white">Interviews</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 rounded-2xl border border-primary py-4">
            <Text className="text-center font-extrabold text-primary">Home Visits</Text>
          </TouchableOpacity>
        </View>

        <View className="gap-4">
          {appointments.map((item) => (
            <View key={item.title} className="rounded-3xl border border-gray-100 bg-white p-5 dark:bg-gray-800 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-green-50">
                  <Ionicons name={item.icon as any} size={23} color="#2D6A4F" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-extrabold text-darkBlue dark:text-white">{item.title}</Text>
                  <Text className="text-sm text-neutral dark:text-gray-400">{item.date}</Text>
                </View>
                <Text className={`text-xs font-extrabold ${item.status === "Confirmed" ? "text-primary" : "text-amber-500"}`}>{item.status}</Text>
              </View>
              <TouchableOpacity className="mt-4 rounded-2xl border border-primary py-3" onPress={() => Alert.alert("Reschedule request sent", "Staff will review your preferred schedule.")}>
                <Text className="text-center font-extrabold text-primary">Request Reschedule</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
