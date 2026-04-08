import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function Donate() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("gcash");

  const amounts = [500, 1000, 2500, 5000];

  const handleDonate = () => {
    const finalAmount =
      selectedAmount === "custom" ? customAmount : selectedAmount;

    if (!finalAmount || Number(finalAmount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid donation amount.");
      return;
    }

    Alert.alert(
      "Thank You! 🐾",
      `Your generous donation of ₱${finalAmount} helps us save more pets at Happy Paws Shelter!`,
      [{ text: "Back to Home", onPress: () => router.push("/(tabs)") }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView
        // 👉 FIX 1: Set Android behavior to undefined so the OS handles it naturally
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-6 mt-4 mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center z-10"
          >
            <Ionicons name="close" size={24} color="#2D6A4F" />
          </TouchableOpacity>
          <View className="absolute left-0 right-0 items-center pointer-events-none">
            <Text className="text-xl font-bold text-darkBlue dark:text-white">
              Make a Donation
            </Text>
          </View>
        </View>

        <ScrollView
          // 👉 FIX 2: Increased paddingBottom to 180 so the input clears the sticky button
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
          // 👉 FIX 3: Ensures tapping outside the keyboard dismisses it smoothly
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View className="items-center mt-6 mb-8">
            <View className="w-20 h-20 bg-green-50 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4">
              <Ionicons name="heart" size={40} color="#EF4444" />
            </View>
            <Text className="text-2xl font-extrabold text-darkBlue dark:text-white text-center mb-2">
              Help us save more lives
            </Text>
            <Text className="text-neutral dark:text-gray-400 text-center text-base px-4">
              Your contribution goes directly to food, medicine, and shelter for
              rescued animals.
            </Text>
          </View>

          {/* Amount Selection */}
          <Text className="text-lg font-bold text-darkBlue dark:text-white mb-4">
            Select Amount
          </Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            {amounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => {
                  setSelectedAmount(amt);
                  setCustomAmount(""); // Clear custom if they tap a preset
                }}
                className={`w-[48%] py-4 rounded-2xl border-2 mb-3 items-center ${
                  selectedAmount === amt
                    ? "bg-primary border-primary dark:bg-emerald-700 dark:border-emerald-700"
                    : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`font-bold text-lg ${
                    selectedAmount === amt
                      ? "text-white"
                      : "text-darkBlue dark:text-white"
                  }`}
                >
                  ₱{amt}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Custom Amount Button */}
            <TouchableOpacity
              onPress={() => setSelectedAmount("custom")}
              className={`w-[48%] py-4 rounded-2xl border-2 mb-3 items-center ${
                selectedAmount === "custom"
                  ? "bg-primary border-primary dark:bg-emerald-700 dark:border-emerald-700"
                  : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
              }`}
            >
              <Text
                className={`font-bold text-lg ${
                  selectedAmount === "custom"
                    ? "text-white"
                    : "text-darkBlue dark:text-white"
                }`}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Amount Input Field */}
          {selectedAmount === "custom" && (
            <View className="mb-6">
              <View className="flex-row items-center bg-white dark:bg-gray-800 border-2 border-primary rounded-2xl px-4 py-2">
                <Text className="text-2xl font-bold text-darkBlue dark:text-white mr-2">
                  ₱
                </Text>
                <TextInput
                  className="flex-1 text-2xl font-bold text-darkBlue dark:text-white py-2"
                  placeholder="0"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  autoFocus // Automatically opens keyboard when selected
                />
              </View>
            </View>
          )}

          {/* Payment Method Mockup */}
          <Text className="text-lg font-bold text-darkBlue dark:text-white mb-4 mt-2">
            Payment Method
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-2 shadow-sm mb-4">
            {/* GCash */}
            <TouchableOpacity
              onPress={() => setSelectedMethod("gcash")}
              className="flex-row items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center">
                  <Ionicons name="phone-portrait" size={20} color="#3B82F6" />
                </View>
                <Text className="text-darkBlue dark:text-white font-bold ml-4 text-base">
                  GCash
                </Text>
              </View>
              <Ionicons
                name={
                  selectedMethod === "gcash"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={selectedMethod === "gcash" ? "#2D6A4F" : "#D1D5DB"}
              />
            </TouchableOpacity>

            {/* Credit/Debit Card */}
            <TouchableOpacity
              onPress={() => setSelectedMethod("card")}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full items-center justify-center">
                  <Ionicons name="card" size={20} color="#F97316" />
                </View>
                <Text className="text-darkBlue dark:text-white font-bold ml-4 text-base">
                  Credit / Debit Card
                </Text>
              </View>
              <Ionicons
                name={
                  selectedMethod === "card"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={selectedMethod === "card" ? "#2D6A4F" : "#D1D5DB"}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Sticky Button */}
        <View
          className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 ${
            Platform.OS === "ios" ? "pb-8" : ""
          }`}
        >
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl items-center shadow-sm"
            onPress={handleDonate}
          >
            <Text className="text-white font-bold text-lg">
              Donate ₱
              {selectedAmount === "custom"
                ? customAmount || "0"
                : selectedAmount}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}