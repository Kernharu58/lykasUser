import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FosterApplication() {
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  const [period, setPeriod] = useState("1 month");
  const [experience, setExperience] = useState("");

  const submit = () => {
    Alert.alert("Foster application saved", "Shelter staff will review your foster commitment.", [
      { text: "Track Application", onPress: () => router.replace("/(tabs)/my-applications") },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color="#D4622A" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#2C2C2C] dark:text-white">Foster Application</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        <View className="rounded-3xl bg-white p-5 border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
          <Text className="text-xs font-bold uppercase tracking-widest text-[#D4622A]">Pet ID: {petId}</Text>
          <Text className="mt-2 text-xl font-extrabold text-[#2C2C2C] dark:text-white">Give a temporary home</Text>
          <Text className="mt-2 text-sm leading-5 text-[#7A7068] dark:text-gray-400">Fostering usually lasts 1 to 2 months while staff monitor health and fit.</Text>
        </View>

        <Text className="mt-7 mb-3 text-lg font-extrabold text-[#2C2C2C] dark:text-white">Availability period</Text>
        <View className="flex-row gap-2">
          {["1 month", "2 months", "Flexible"].map((item) => (
            <TouchableOpacity key={item} onPress={() => setPeriod(item)} className={`flex-1 rounded-2xl py-3 ${period === item ? "bg-[#D4622A]" : "bg-white border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700"}`}>
              <Text className={`text-center font-bold ${period === item ? "text-white" : "text-[#7A7068] dark:text-gray-300"}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mt-7 mb-3 text-lg font-extrabold text-[#2C2C2C] dark:text-white">Foster experience</Text>
        <TextInput
          value={experience}
          onChangeText={setExperience}
          multiline
          placeholder="Tell us about your home, schedule, and past pet care experience."
          placeholderTextColor="#B0A898"
          className="min-h-[120px] rounded-3xl border border-[#E8E4DC] bg-white p-4 text-[#2C2C2C] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          textAlignVertical="top"
        />

        <TouchableOpacity className="mt-6 rounded-2xl bg-[#D4622A] py-4" onPress={submit}>
          <Text className="text-center font-extrabold text-white">Submit Foster Application</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
