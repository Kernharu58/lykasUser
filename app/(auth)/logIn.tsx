import { Ionicons } from "@expo/vector-icons"; // 👉 Added Ionicons
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "./../utils/api";

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👉 Added state for toggling password

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      await AsyncStorage.setItem("userToken", response.data.token);
      await AsyncStorage.setItem("userName", response.data.user.displayName);

      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid credentials.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-8"
      >
        {/* --- Logo & Branding --- */}
        <View className="items-center mb-10">
          <View className="items-center mb-3">
            <View className="w-5 h-5 rounded-full bg-primary" />
            <View className="flex-row mt-1 space-x-2">
              <View className="w-5 h-5 rounded-full bg-primary mr-1" />
              <View className="w-5 h-5 rounded-full bg-primary ml-1" />
            </View>
          </View>
          <Text className="text-3xl font-bold text-primary mb-1">CarePaws</Text>
          <Text className="text-neutral text-sm">Professional Pet Care</Text>
        </View>

        {/* --- Input Fields --- */}
        <View className="mb-6">
          <TextInput
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 mb-4 text-darkBlue font-medium"
            placeholder="Email Address"
            placeholderTextColor="#AAAAAA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* 👉 Wrapped Password Input for Eye Icon */}
          <View className="relative justify-center">
            <TextInput
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 pr-12 text-darkBlue font-medium"
              placeholder="Password"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // 👉 Toggles based on state
            />
            <TouchableOpacity
              className="absolute right-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#AAAAAA"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Primary Actions --- */}
        <TouchableOpacity
          className="w-full bg-primary py-4 rounded-xl items-center mb-4 shadow-sm"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-transparent border-2 border-primary py-4 rounded-xl items-center mb-8"
          onPress={() => router.push("/(auth)/signUp")}
          disabled={loading}
        >
          <Text className="text-primary font-bold text-base">Sign Up</Text>
        </TouchableOpacity>

        {/* --- Divider --- */}
        <View className="items-center mb-6">
          <Text className="text-neutral text-sm">Or continue with</Text>
        </View>

        {/* --- Social Login --- */}
        <TouchableOpacity className="w-full bg-white border border-gray-200 py-4 rounded-xl flex-row justify-center items-center shadow-sm">
          <Text className="text-green-500 font-bold text-lg mr-2">G</Text>
          <Text className="text-darkBlue font-bold text-base">Google</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
