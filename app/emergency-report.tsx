import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

const types = [
  { key: "injured_animal",    label: "Injured Animal", icon: "medkit-outline" },
  { key: "stray_animal",      label: "Stray Animal",   icon: "paw-outline" },
  { key: "abuse_report",      label: "Abuse Report",   icon: "warning-outline" },
  { key: "abandoned_animal",  label: "Abandoned",      icon: "home-outline" },
  { key: "other",             label: "Other",          icon: "help-circle-outline" },
];

export default function EmergencyReport() {
  const router = useRouter();
  const [selected, setSelected] = useState("injured_animal");
  const [animalType, setAnimalType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() || !location.trim()) {
      Alert.alert("Required fields", "Please provide a description and location.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/emergency-reports", {
        type: selected,
        animalType: animalType || undefined,
        description: description.trim(),
        location:    location.trim(),
        contactPhone: contactPhone || undefined,
      });
      Alert.alert(
        "Report Submitted 🐾",
        "Our team has been notified and will respond as soon as possible.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not submit report.");
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color={COLORS.danger} />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-ink dark:text-white">Report Concern</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        <View className="rounded-3xl bg-red-500 p-5 mb-5">
          <Text className="text-2xl font-extrabold text-white">Pet welfare emergency</Text>
          <Text className="mt-2 text-white/90">Send urgent concerns to staff immediately.</Text>
        </View>

        <Text className="mb-3 font-extrabold text-ink dark:text-white">Type of concern</Text>
        <View className="mb-5 flex-row flex-wrap gap-2">
          {types.map(t => (
            <TouchableOpacity key={t.key}
              className={`flex-row items-center rounded-2xl px-4 py-3 ${selected === t.key ? "bg-red-500" : "border border-border bg-white dark:bg-gray-800"}`}
              onPress={() => setSelected(t.key)}>
              <Ionicons name={t.icon as any} size={16} color={selected === t.key ? "#fff" : COLORS.muted} />
              <Text className={`ml-2 font-extrabold ${selected === t.key ? "text-white" : "text-ink dark:text-white"}`}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mb-2 font-extrabold text-ink dark:text-white">Animal type (optional)</Text>
        <TextInput value={animalType} onChangeText={setAnimalType}
          placeholder="e.g. Dog, Cat, Bird" placeholderTextColor={COLORS.mutedLight}
          className="mb-5 rounded-2xl border border-border bg-white px-4 py-4 text-ink dark:bg-gray-800 dark:border-gray-700 dark:text-white" />

        <Text className="mb-2 font-extrabold text-ink dark:text-white">Location *</Text>
        <TextInput value={location} onChangeText={setLocation}
          placeholder="Street address or landmark" placeholderTextColor={COLORS.mutedLight}
          className="mb-5 rounded-2xl border border-border bg-white px-4 py-4 text-ink dark:bg-gray-800 dark:border-gray-700 dark:text-white" />

        <Text className="mb-2 font-extrabold text-ink dark:text-white">Description *</Text>
        <TextInput value={description} onChangeText={setDescription} multiline
          placeholder="Describe what happened and what help is needed..." placeholderTextColor={COLORS.mutedLight}
          className="mb-5 min-h-[140px] rounded-2xl border border-border bg-white px-4 py-4 text-ink dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          textAlignVertical="top" />

        <Text className="mb-2 font-extrabold text-ink dark:text-white">Contact number (optional)</Text>
        <TextInput value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad"
          placeholder="Your phone number" placeholderTextColor={COLORS.mutedLight}
          className="mb-6 rounded-2xl border border-border bg-white px-4 py-4 text-ink dark:bg-gray-800 dark:border-gray-700 dark:text-white" />

        <TouchableOpacity className="rounded-2xl bg-red-500 py-4" onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" />
            : <Text className="text-center font-extrabold text-white">Submit Emergency Report</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}