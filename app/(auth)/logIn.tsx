import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import api from "../../utils/api";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, userToken, setUserToken, setUser } = useAuth();

  // BUG FIX: Move constants inside component scope (was in outer scope before)
  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
  const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || "";
  const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_CLIENT_ID || "";

const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: WEB_CLIENT_ID,
  androidClientId: ANDROID_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  redirectUri: makeRedirectUri({
    scheme: "com.kernharu.carepaws:/oauth2redirect/google"
  }),
});

  useEffect(() => {
    if (response?.type === "success") {
      // BUG FIX: Check both idToken (PKCE) and id_token (implicit) locations
      const idToken =
        response.authentication?.idToken ||
        response.params?.id_token ||
        response.params?.id_token;

      if (idToken) {
        handleGoogleBackendLogin(idToken);
      } else {
        Alert.alert("Google Auth Error", "No ID Token returned from Google.");
      }
    } else if (response?.type === "error") {
      Alert.alert("Authentication Error", "Failed to authenticate with Google.");
    }
  }, [response]);

  const handleGoogleBackendLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });

      await SecureStore.setItemAsync("userToken", res.data.token);
      await SecureStore.setItemAsync("userName", res.data.user.displayName || "");
      await SecureStore.setItemAsync("userData", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setUserToken(res.data.token);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("[GoogleLogin] Error:", error);
      Alert.alert("Login Error", "Could not verify Google account with server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      await SecureStore.setItemAsync("userToken", res.data.token);
      await SecureStore.setItemAsync("userName", res.data.user.displayName || "");
      await SecureStore.setItemAsync("userData", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setUserToken(res.data.token);
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid credentials.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || userToken) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-8"
      >
        {/* Logo & Branding */}
        <View className="items-center mb-10">
          <View className="items-center mb-3">
            <View className="w-5 h-5 rounded-full bg-primary" />
            <View className="flex-row mt-1 space-x-2">
              <View className="w-5 h-5 rounded-full bg-primary mr-1" />
              <View className="w-5 h-5 rounded-full bg-primary ml-1" />
            </View>
          </View>
          <Text className="text-3xl font-bold text-primary mb-1">CarePaws</Text>
          <Text className="text-neutral text-sm">Your Pet Adoption Companion</Text>
        </View>

        {/* Input Fields */}
        <View className="mb-6">
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

          <View className="relative justify-center mb-2">
            <TextInput
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 pr-12 text-darkBlue font-medium"
              placeholder="Password"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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

          <TouchableOpacity
            onPress={() => router.push("/forgot-password")}
            className="mb-6"
          >
            <Text className="text-primary font-bold text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Actions */}
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
          <Text className="text-primary font-bold text-base">Create Account</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="items-center mb-6">
          <Text className="text-neutral text-sm">Or continue with</Text>
        </View>

        {/* Google Sign In */}
        <TouchableOpacity
          className="w-full bg-white border border-gray-200 py-4 rounded-xl flex-row justify-center items-center shadow-sm"
          onPress={() => promptAsync()}
          disabled={!request || loading}
        >
          <Text className="text-green-600 font-bold text-lg mr-2">G</Text>
          <Text className="text-darkBlue font-bold text-base">Sign in with Google</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
