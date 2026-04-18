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

// Ensures the web browser closes automatically after Google login
WebBrowser.maybeCompleteAuthSession();



export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, userToken, setUserToken, setUser } = useAuth(); 

// Update the variables and Google.useAuthRequest block in logIn.tsx:

// 👉 Pull from .env instead of hardcoding. Add fallback strings just in case during transition.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "528938082763-19063pq62uklsq11u0fnbts83ck9s300.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || "528938082763-11ntud5qgc7c4621ek150octg4mbt17h.apps.googleusercontent.com";
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_CLIENT_ID || "528938082763-hscdu38la3la2dmh1hjr3b2t8cgi224b.apps.googleusercontent.com";

const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: WEB_CLIENT_ID,
  androidClientId: ANDROID_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID, // FIX 4: Uncommented iOS
  redirectUri: makeRedirectUri({
    // Standardizing redirect for Expo Go and bare workflow
    scheme: "carepaws" 
  }),
});


  // 2. Listen for the Google response
useEffect(() => {
  if (response?.type === "success") {
    // Safely check both places for the token
    const id_token = response.authentication?.idToken || response.params?.id_token;

    if (id_token) {
      handleGoogleBackendLogin(id_token);
    } else {
      Alert.alert("Google Auth Error", "No ID Token returned from Google.");
    }
  } else if (response?.type === "error") {
    Alert.alert("Authentication Error", "Failed to authenticate with Google.");
  }
}, [response]);

  // 3. Send the ID Token to your Node.js Backend
  const handleGoogleBackendLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });

      await SecureStore.setItemAsync("userToken", res.data.token);
      await SecureStore.setItemAsync("userName", res.data.user.displayName);
      await SecureStore.setItemAsync("userData", JSON.stringify(res.data.user)); 
      
      setUser(res.data.user);
      setUserToken(res.data.token);

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Backend Verification Error:", error);
      Alert.alert("Login Error", "Could not verify Google account with server.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Standard Email/Password Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });

      await SecureStore.setItemAsync("userToken", response.data.token);
      await SecureStore.setItemAsync("userName", response.data.user.displayName);
      await SecureStore.setItemAsync("userData", JSON.stringify(response.data.user)); 
      
      setUser(response.data.user);
      setUserToken(response.data.token);
      
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

          <View className="relative justify-center">
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
        <TouchableOpacity 
          className="w-full bg-white border border-gray-200 py-4 rounded-xl flex-row justify-center items-center shadow-sm"
          onPress={() => promptAsync()} 
          disabled={!request || loading}
        >
          <Text className="text-green-500 font-bold text-lg mr-2">G</Text>
          <Text className="text-darkBlue font-bold text-base">Google</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}