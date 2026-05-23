import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const events = [
  { title: "Adoption Drive", type: "Adoption Drive", date: "Jun 15, 2026", time: "9AM-3PM", place: "Eastwood City Mall", going: 42, spots: 20 },
  { title: "Pet Care Training", type: "Training", date: "Jun 22, 2026", time: "1PM-5PM", place: "CarePaws Shelter", going: 18, spots: 12 },
  { title: "Community Outreach", type: "Outreach", date: "Jul 3, 2026", time: "8AM-12PM", place: "Angeles City Plaza", going: 27, spots: 30 },
];

export default function Events() {
  const [mode, setMode] = useState<"Upcoming" | "Past">("Upcoming");

  return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
        <View className="mt-4 mb-5">
          <Text className="text-3xl font-extrabold text-[#2C2C2C] dark:text-white">Community Events</Text>
          <Text className="text-[#7A7068] dark:text-gray-400 mt-2">RSVP, volunteer, and meet adoptable pets in person.</Text>
        </View>

        <View className="mb-5 flex-row rounded-2xl bg-[#F4F2EE] p-1 dark:bg-gray-800">
          {(["Upcoming", "Past"] as const).map((item) => (
            <TouchableOpacity key={item} className={`flex-1 rounded-xl py-3 ${mode === item ? "bg-white dark:bg-gray-700" : ""}`} onPress={() => setMode(item)}>
              <Text className={`text-center font-bold ${mode === item ? "text-[#D4622A]" : "text-[#7A7068]"}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="gap-4">
          {events.map((event) => (
            <View key={event.title} className="rounded-3xl border border-[#E8E4DC] bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="rounded-full bg-[#F5EDD6] px-3 py-1">
                  <Text className="text-xs font-bold text-[#D4622A]">{event.type}</Text>
                </View>
                <Text className="text-xs font-bold text-[#7A7068]">{event.date}</Text>
              </View>
              <Text className="text-xl font-extrabold text-[#2C2C2C] dark:text-white">{event.title}</Text>
              <View className="mt-3 gap-2">
                <Text className="text-sm font-medium text-[#7A7068] dark:text-gray-400"><Ionicons name="time-outline" size={14} /> {event.time}</Text>
                <Text className="text-sm font-medium text-[#7A7068] dark:text-gray-400"><Ionicons name="location-outline" size={14} /> {event.place}</Text>
                <Text className="text-sm font-medium text-[#7A7068] dark:text-gray-400"><Ionicons name="people-outline" size={14} /> {event.going} going - {event.spots} spots left</Text>
              </View>
              <TouchableOpacity className="mt-5 rounded-xl bg-[#D4622A] py-3">
                <Text className="text-center font-bold text-white">RSVP</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
