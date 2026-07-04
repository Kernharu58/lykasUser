import { Ionicons } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
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
import { COLORS } from "../../utils/colors";

WebBrowser.maybeCompleteAuthSession();

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, userToken, setUserToken, setUser } = useAuth();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateToHome = (onReady: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(onReady);
  };

  const WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
  const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || "";
  const IOS_CLIENT_ID     = process.env.EXPO_PUBLIC_IOS_CLIENT_ID || "";

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
      const idToken =
        response.authentication?.idToken ||
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

      navigateToHome(() => router.replace("/(tabs)"));
    } catch (error) {
      console.error("[GoogleLogin] Error:", error);
      setLoading(false);
      Alert.alert("Login Error", "Could not verify Google account with server.");
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

      navigateToHome(() => router.replace("/(tabs)"));
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || "Invalid credentials.";
      Alert.alert("Login Failed", message);
    }
  };

  if (isLoading || userToken) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primaryDeep} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
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
              placeholderTextColor={COLORS.neutral}
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
                placeholderTextColor={COLORS.neutral}
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
                  color={COLORS.neutral}
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
      </Animated.View>
    </SafeAreaView>
  );
}
