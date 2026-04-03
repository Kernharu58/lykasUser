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
import api from "../../utils/api";

export default function AdoptionApplication() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone || !address || !experience) {
      Alert.alert("Required", "Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      // Send the application data to the backend
      const response = await api.post(`/pets/${id}/adopt`, {
        phone,
        address,
        experience,
      });

      Alert.alert(
        "Application Submitted!",
        "The shelter will review your application and contact you soon.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/adopt"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to apply.");
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
              Application
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        >
          <View className="mb-8">
            <Text className="text-2xl font-bold text-darkBlue dark:text-white mb-2">
              Adoption Form
            </Text>
            <Text className="text-neutral dark:text-gray-400 leading-5">
              Please provide your details so the shelter can contact you to
              proceed with the adoption.
            </Text>
          </View>

          <View className="space-y-4 mb-8">
            <View>
              <Text className="text-darkBlue dark:text-white font-bold mb-2 ml-1">
                Phone Number
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
                Home Address / City
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-darkBlue dark:text-white font-medium"
                placeholder="e.g., Angeles City, Pampanga"
                placeholderTextColor="#AAAAAA"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View className="mt-4">
              <Text className="text-darkBlue dark:text-white font-bold mb-2 ml-1">
                Living Situation & Experience
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-darkBlue dark:text-white font-medium"
                placeholder="Tell us about your home and if you have other pets..."
                placeholderTextColor="#AAAAAA"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={experience}
                onChangeText={setExperience}
              />
            </View>
          </View>

          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl items-center shadow-sm"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Submit Application
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
