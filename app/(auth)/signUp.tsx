import { Ionicons } from "@expo/vector-icons"; // 👉 Added Ionicons
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

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👉 Added state for toggling password

  // Inside your SignUp component:
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // 👉 ADD THIS: Password Complexity Checker
    // This Regex ensures: 1 Lowercase, 1 Uppercase, 1 Number, 1 Symbol, and 8+ length
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol (e.g., !, @, #).",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        displayName: name,
        email: email,
        password: password,
      });

      Alert.alert("Success!", "Your account has been created.");
      router.replace("/(auth)/logIn");
    } catch (error: any) {
      console.log("SIGNUP ERROR DETAILS:", error.message, error.response?.data);
      const message = error.response?.data?.message || "Something went wrong";
      Alert.alert("Registration Failed", message);
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
        {/* --- Branding --- */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-primary mb-1">
            Join CarePaws
          </Text>
          <Text className="text-neutral text-sm text-center">
            Create an account to adopt pets and volunteer at the shelter.
          </Text>
        </View>

        {/* --- Input Fields --- */}
        <View className="mb-8">
          <TextInput
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 mb-4 text-darkBlue font-medium"
            placeholder="Display Name (e.g., Whesley)"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
          />
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
              placeholder="Create Password"
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

        {/* --- Actions --- */}
        <TouchableOpacity
          className="w-full bg-primary py-4 rounded-xl items-center mb-4 shadow-sm"
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-neutral text-sm">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-bold text-sm">Log in here</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
