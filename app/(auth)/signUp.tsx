import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
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
import { useAuth } from "../../context/AuthContext";
import { registerWithRetry } from "../../utils/api";

export default function SignUp() {
  const router = useRouter();
  const { setUserToken, setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Empty field check
    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Password complexity check
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(trimmedPassword)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol (e.g., !, @, #).",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await registerWithRetry({
        displayName: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      console.log("[SignUp] ✅ Success:", response);

      if (response.token) {
        const userData = response.user || { displayName: trimmedName, email: trimmedEmail };

        await SecureStore.setItemAsync("userToken", response.token);
        await SecureStore.setItemAsync("userName", userData.displayName || trimmedName);
        await SecureStore.setItemAsync("userData", JSON.stringify(userData));

        setUser(userData);
        setUserToken(response.token);

        console.log("[SignUp] ✅ Auto-login successful, navigating to tabs");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Success!", response.message || "Your account has been created. Please log in.");
        router.replace("/(auth)/logIn");
      }
    } catch (error: any) {
      console.error("[SignUp] ❌ Error:", error.response?.data || error.message);

      const status = error.response?.status;
      const serverMessage = error.response?.data?.message || "";

      if (!error.response) {
        Alert.alert(
          "Connection Error",
          "Unable to reach the server. Please check your internet connection and try again."
        );
      } else if (status === 400 || status === 409) {
        // Handle duplicate user — backend returns 400 with "User already exists"
        if (
          serverMessage.toLowerCase().includes("user already exists") ||
          serverMessage.toLowerCase().includes("already exists") ||
          serverMessage.toLowerCase().includes("already registered")
        ) {
          Alert.alert(
            "Account Already Exists",
            "This email is already registered. Would you like to log in instead?",
            [
              { text: "Log In", onPress: () => router.replace("/(auth)/logIn") },
              { text: "Cancel", style: "cancel" },
            ]
          );
        } else {
          // Other 400 validation errors
          const details = error.response?.data?.details || [];
          let message = serverMessage || "Invalid input. Please check your details.";
          if (details.length > 0) {
            message += `\n\n${details.join("\n")}`;
          }
          Alert.alert("Registration Failed", message);
        }
      } else if (status === 429) {
        Alert.alert(
          "Too Many Attempts",
          "You've made too many requests. Please wait a moment and try again."
        );
      } else {
        Alert.alert(
          "Registration Failed",
          serverMessage || "Something went wrong. Please try again."
        );
      }
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
        {/* Branding */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-primary mb-1">
            Join CarePaws
          </Text>
          <Text className="text-neutral text-sm text-center">
            Create an account to adopt pets and volunteer at the shelter.
          </Text>
        </View>

        {/* Input Fields */}
        <View className="mb-8">
          <TextInput
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 mb-4 text-darkBlue font-medium"
            placeholder="Display Name (e.g., Whesley)"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 mb-4 text-darkBlue font-medium"
            placeholder="Email Address"
            placeholderTextColor="#AAAAAA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Input with Eye Toggle */}
          <View className="relative justify-center mb-4">
            <TextInput
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 pr-12 text-darkBlue font-medium"
              placeholder="Create Password"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
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

        {/* Actions */}
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
          <TouchableOpacity onPress={() => router.replace("/(auth)/logIn")}>
            <Text className="text-primary font-bold text-sm">Log in here</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}