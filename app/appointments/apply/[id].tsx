import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../utils/api";

export default function VolunteerApplication() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Gets the specific shift ID

  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!phone || !emergencyContact) {
      Alert.alert(
        "Required",
        "Please provide your phone number and an emergency contact.",
      );
      return;
    }

    setLoading(true);
    try {
      // Hit your existing enroll endpoint!
      const response = await api.post(`/appointments/${id}/enroll`, {
        phone,
        emergencyContact,
        notes,
      });

      Alert.alert(
        "Shift Confirmed!",
        "Thank you for volunteering! You are now enrolled in this shift.",
        [
          {
            text: "View My Shifts",
            onPress: () => router.replace("/my-appointments"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Could not sign up for this shift.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-6 mt-4 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center z-10"
          >
            <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
            <Text className="text-primary font-bold ml-1">Cancel</Text>
          </TouchableOpacity>
          <View className="absolute left-0 right-0 items-center pointer-events-none">
            <Text className="text-xl font-bold text-darkBlue dark:text-white">
              Sign Up
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        >
          <View className="mb-8">
            <Text className="text-2xl font-bold text-darkBlue dark:text-white mb-2">
              Volunteer Details
            </Text>
            <Text className="text-neutral dark:text-gray-400 leading-5">
              Please provide your contact information to confirm your slot for
              this shift.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4 mb-8">
            <View>
              <Text className="text-darkBlue dark:text-white font-bold mb-2 ml-1">
                Your Phone Number
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-darkBlue dark:text-white font-medium"
                placeholder="e.g., +63 912 345 6789"
                placeholderTextColor="#AAAAAA"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View className="mt-4">
              <Text className="text-darkBlue dark:text-white font-bold mb-2 ml-1">
                Emergency Contact Name & Number
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-darkBlue dark:text-white font-medium"
                placeholder="e.g., Jane Doe - 09987654321"
                placeholderTextColor="#AAAAAA"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />
            </View>

            <View className="mt-4">
              <Text className="text-darkBlue dark:text-white font-bold mb-2 ml-1">
                Any medical conditions we should know about?
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-darkBlue dark:text-white font-medium"
                placeholder="Optional notes..."
                placeholderTextColor="#AAAAAA"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl items-center shadow-sm"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Confirm Shift
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
