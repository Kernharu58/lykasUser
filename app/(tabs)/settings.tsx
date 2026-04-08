import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api"; // 👉 Added missing API import

export default function Settings() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // 👉 Moved these INSIDE the component where they belong!
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { logout } = useAuth();

  // 👉 1. Theme Logic
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const toggleDarkMode = async (value: boolean) => {
    const newTheme = value ? "dark" : "light";
    setColorScheme(newTheme);
    await AsyncStorage.setItem("appTheme", newTheme); 
  };

 useEffect(() => {
    // 👉 Load the saved theme when the screen opens
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("appTheme");
      if (savedTheme) {
        setColorScheme(savedTheme as "light" | "dark");
      } else if (!colorScheme) {
        setColorScheme("light");
      }
    };
    
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setDisplayName(response.data.displayName);
        if (response.data.profilePicture) {
          setProfilePicture(response.data.profilePicture);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    loadTheme();
    fetchUserProfile();
  }, []);

  const pickImage = async () => {
    // Request permission (mostly required for iOS)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Lets them crop it to a square!
      aspect: [1, 1],
      quality: 0.7, // Compress it slightly for faster uploads
    });

    if (!result.canceled) {
      handleUploadImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async (uri: string) => {
    setUploadingImage(true);
    try {
      // React Native requires a very specific FormData format for file uploads
      const formData = new FormData();
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      // TypeScript might complain about this 'any' cast, but it is necessary for React Native FormData
      formData.append("image", { uri, name: filename, type } as any);

      // Send it using multipart/form-data
      const response = await api.post("/auth/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update the UI immediately with the new Cloudinary URL!
      setProfilePicture(response.data.profilePicture);
      Alert.alert("Success", "Profile picture updated!");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Upload Failed", "Could not upload the image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel", 
        },
        {
          text: "Yes",
          style: "destructive", 
          onPress: logout, 
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 mt-4 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center z-10"
        >
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center pointer-events-none">
          <Text className="text-xl font-bold text-darkBlue dark:text-white">
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- 1. Avatar & User Info --- */}
        <View className="items-center mb-10 mt-2">
          <View className="relative">
            {/* 👉 Added the new interactive Avatar button! */}
            <TouchableOpacity 
              className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4 shadow-sm overflow-hidden border-2 border-white dark:border-gray-800"
              onPress={pickImage} 
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#ffffff" />
              ) : profilePicture ? (
                <Image 
                  source={{ uri: profilePicture }} 
                  className="w-full h-full" 
                  resizeMode="cover" 
                />
              ) : (
                <Text className="text-white text-4xl font-bold">
                  {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="absolute bottom-4 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-600"
              onPress={pickImage} // 👉 Triggers the camera roll!
            >
              <Ionicons name="camera" size={16} color="#2D6A4F" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-darkBlue mb-1 dark:text-white">
            {displayName}
          </Text>
          <Text className="text-neutral text-sm font-medium dark:text-gray-400">
            Pet Parent in Mexico, Pampanga
          </Text>
        </View>

        {/* --- 2. Quick Links --- */}
        <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 dark:bg-gray-800">
          <TouchableOpacity
            className="flex-row items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700"
            onPress={() => router.push("/appointments")}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#fcf3ed] dark:bg-gray-700 items-center justify-center">
                <Ionicons name="calendar" size={20} color="#D08C60" />
              </View>
              <Text className="text-darkBlue font-bold text-base ml-4 dark:text-white">
                My Appointments
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700"
            onPress={() => router.push("../favorites")} 
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-red-50 dark:bg-gray-700 items-center justify-center">
                <Ionicons name="heart" size={20} color="#EF4444" />
              </View>
              <Text className="text-darkBlue font-bold text-base ml-4 dark:text-white">
                Favorites
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-3"
            onPress={() => router.push("/my-pets")}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#fcf3ed] dark:bg-gray-700 items-center justify-center">
                <Ionicons name="paw" size={20} color="#D08C60" />
              </View>
              <Text className="text-darkBlue font-bold text-base ml-4 dark:text-white">
                My Pet
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* --- 3. App Preferences --- */}
        <View className="mb-8">
          <Text className="text-base font-bold text-neutral mb-3 uppercase tracking-wider ml-1 dark:text-gray-400">
            Preferences
          </Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-50 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-green-50 dark:bg-gray-700 items-center justify-center mr-4">
                  <Ionicons name="notifications" size={20} color="#2D6A4F" />
                </View>
                <Text className="text-darkBlue font-bold text-base dark:text-white">
                  Push Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E5E7EB", true: "#2D6A4F" }}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-[#f0f4ff] dark:bg-gray-700 items-center justify-center mr-4">
                  <Ionicons
                    name={isDarkMode ? "moon" : "moon-outline"}
                    size={20}
                    color="#3B82F6"
                  />
                </View>
                <Text className="text-darkBlue font-bold text-base dark:text-white">
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#E5E7EB", true: "#2D6A4F" }}
              />
            </View>
          </View>
        </View>

        {/* --- 4. Contacts --- */}
        <View className="bg-primary rounded-3xl p-6 shadow-sm mb-8 relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white opacity-10" />
          <Text className="text-white font-extrabold text-xl mb-1">
            Get in Touch
          </Text>
          <Text className="text-white/80 text-sm mb-6 font-medium">
            We&apos;re here to help you and your pets.
          </Text>
          <View className="space-y-5">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                <Ionicons name="location" size={16} color="#FFFFFF" />
              </View>
              <Text className="text-white font-medium">
                Happy Paws Shelter, Pampanga
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                <Ionicons name="call" size={16} color="#FFFFFF" />
              </View>
              <Text className="text-white font-medium">+63 939 268 3311</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                <Ionicons name="mail" size={16} color="#FFFFFF" />
              </View>
              <Text className="text-white font-medium">info@carepaws.org</Text>
            </View>
          </View>
        </View>

        {/* --- 5. Log Out Button --- */}
        <TouchableOpacity
          className="bg-red-50 dark:bg-red-900/20 py-4 rounded-2xl flex-row items-center justify-center border border-red-100 dark:border-red-900/30 mb-6 shadow-sm"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}