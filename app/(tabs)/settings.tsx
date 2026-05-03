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
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api"; 
import * as SecureStore from 'expo-secure-store';

export default function Settings() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // 👉 NEW: Edit Profile State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { logout, user, setUser } = useAuth();

  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";


  // 👉 NEW: Store dynamic contact info
  const [contactInfo, setContactInfo] = useState({
    address: "Happy Paws Shelter, Pampanga",
    phone: "+63 939 268 3311",
    email: "info@carepaws.org"
  });

  useEffect(() => {
    const fetchShelterSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data) setContactInfo(res.data);
      } catch (error) {
        console.error("Error fetching shelter settings:", error);
      }
    };
    fetchShelterSettings();
  }, []);

  const toggleDarkMode = async (value: boolean) => {
    const newTheme = value ? "dark" : "light";
    setColorScheme(newTheme);
    await AsyncStorage.setItem("appTheme", newTheme); 
  };

  useEffect(() => {
    const loadPreferences = async () => {
      const savedNotifs = await AsyncStorage.getItem("notificationsEnabled");
      if (savedNotifs !== null) {
        setNotificationsEnabled(savedNotifs === "true");
      }
    };
    
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setDisplayName(response.data.displayName);
        if (response.data.profilePicture) {
          setProfilePicture(response.data.profilePicture);
        }
        // 👉 NEW: If backend has a saved notification status, use it to sync devices
        if (response.data.notificationsEnabled !== undefined) {
          setNotificationsEnabled(response.data.notificationsEnabled);
          await AsyncStorage.setItem("notificationsEnabled", response.data.notificationsEnabled.toString());
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    loadPreferences();
    fetchUserProfile();
  }, []);

  // 👉 NEW: Function to handle toggling notifications
  const handleToggleNotifications = async (value: boolean) => {
    // 1. Instantly update UI for a snappy feel
    setNotificationsEnabled(value);
    
    // 2. Save locally so it remembers on next app open
    await AsyncStorage.setItem("notificationsEnabled", value.toString());

    // 3. Sync to backend silently
    try {
      await api.put("/auth/profile", { notificationsEnabled: value });
    } catch (error) {
      console.error("Error syncing notification preference to server:", error);
      // Optional: Revert UI if you want to be strict, but usually better to let local storage win
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUploadImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async (uri: string) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("image", { uri, name: filename, type } as any);

      const response = await api.post("/auth/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfilePicture(response.data.profilePicture);
      Alert.alert("Success", "Profile picture updated!");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Upload Failed", "Could not upload the image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put("/auth/profile", { displayName: editName });
      
      setDisplayName(response.data.user.displayName);
      
      if (user) {
        setUser({ ...user, displayName: response.data.user.displayName });
        await SecureStore.setItemAsync("userData", JSON.stringify({ ...user, displayName: response.data.user.displayName }));
      }
      
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [{ text: "Cancel", style: "cancel" }, { text: "Yes", style: "destructive", onPress: logout }],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center z-10">
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center pointer-events-none">
          <Text className="text-xl font-bold text-darkBlue dark:text-white">Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* --- Email Verification Banner --- */}
        {user && !user.emailVerified && (
          <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex-row items-start">
            <View className="w-5 h-5 rounded-full bg-amber-500 items-center justify-center mr-3 mt-0.5 shrink-0">
              <Text className="text-xs text-white font-bold">!</Text>
            </View>
            <View className="flex-1">
              <Text className="text-amber-900 dark:text-amber-200 font-bold mb-1">Email Not Verified</Text>
              <Text className="text-amber-800 dark:text-amber-300 text-xs mb-2">
                Please verify your email address to ensure you receive important notifications.
              </Text>
              <TouchableOpacity onPress={() => router.push("/verify-email")}>
                <Text className="text-amber-600 dark:text-amber-400 font-bold text-xs">
                  Verify Email →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {user && user.emailVerified && (
          <View className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6 flex-row items-start">
            <View className="w-5 h-5 rounded-full bg-emerald-500 items-center justify-center mr-3 mt-0.5 shrink-0">
              <Text className="text-xs text-white font-bold">✓</Text>
            </View>
            <View>
              <Text className="text-emerald-900 dark:text-emerald-200 font-bold">Email Verified</Text>
              <Text className="text-emerald-800 dark:text-emerald-300 text-xs">
                Your email address has been verified.
              </Text>
            </View>
          </View>
        )}
        
        {/* --- 1. Avatar & User Info --- */}
        <View className="items-center mb-10 mt-2">
          <View className="relative">
            <TouchableOpacity 
              className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4 shadow-sm overflow-hidden border-2 border-white dark:border-gray-800"
              onPress={pickImage} 
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#ffffff" />
              ) : profilePicture ? (
                <Image source={{ uri: profilePicture }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="text-white text-4xl font-bold">
                  {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="absolute bottom-4 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-600"
              onPress={pickImage}
            >
              <Ionicons name="camera" size={16} color="#2D6A4F" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-1">
            <Text className="text-2xl font-bold text-darkBlue dark:text-white">
              {displayName}
            </Text>
            <TouchableOpacity 
              className="ml-3 p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"
              onPress={() => {
                setEditName(displayName);
                setEditModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={14} color="#2D6A4F" />
            </TouchableOpacity>
          </View>
          <Text className="text-neutral text-sm font-medium dark:text-gray-400">
            Pet Parent in Mexico, Pampanga
          </Text>
        </View>

        {/* --- 2. Quick Links --- */}
        <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 dark:bg-gray-800">
          <TouchableOpacity className="flex-row items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700" onPress={() => router.push("/appointments")}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#fcf3ed] dark:bg-gray-700 items-center justify-center">
                <Ionicons name="calendar" size={20} color="#D08C60" />
              </View>
              <Text className="text-darkBlue font-bold text-base ml-4 dark:text-white">My Appointments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700" onPress={() => router.push("../favorites")}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-red-50 dark:bg-gray-700 items-center justify-center">
                <Ionicons name="heart" size={20} color="#EF4444" />
              </View>
              <Text className="text-darkBlue font-bold text-base ml-4 dark:text-white">Favorites</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-3" onPress={() => router.push("/my-pets")}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#fcf3ed] dark:bg-gray-700 items-center justify-center">
                <Ionicons name="paw" size={20} color="#D08C60" />
              </View>
              <Text className="text-darkBlue font-bold text-base ml-4 dark:text-white">My Pet</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* --- 3. App Preferences --- */}
        <View className="mb-8">
          <Text className="text-base font-bold text-neutral mb-3 uppercase tracking-wider ml-1 dark:text-gray-400">Preferences</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-50 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-green-50 dark:bg-gray-700 items-center justify-center mr-4">
                  <Ionicons name="notifications" size={20} color="#2D6A4F" />
                </View>
                <Text className="text-darkBlue font-bold text-base dark:text-white">Push Notifications</Text>
              </View>
              {/* 👉 UPDATED: Switch now uses handleToggleNotifications */}
              <Switch 
                value={notificationsEnabled} 
                onValueChange={handleToggleNotifications} 
                trackColor={{ false: "#E5E7EB", true: "#2D6A4F" }} 
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-[#f0f4ff] dark:bg-gray-700 items-center justify-center mr-4">
                  <Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={20} color="#3B82F6" />
                </View>
                <Text className="text-darkBlue font-bold text-base dark:text-white">Dark Mode</Text>
              </View>
              <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: "#E5E7EB", true: "#2D6A4F" }} />
            </View>
          </View>
        </View>

        {/* --- 4. Contacts --- */}
        <View className="bg-primary rounded-3xl p-6 shadow-sm mb-8 relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white opacity-10" />
          <Text className="text-white font-extrabold text-xl mb-1">Get in Touch</Text>
          <Text className="text-white/80 text-sm mb-6 font-medium">We&apos;re here to help you and your pets.</Text>
          <View className="space-y-5">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3"><Ionicons name="location" size={16} color="#FFFFFF" /></View>
              <Text className="text-white font-medium">{contactInfo.address}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3"><Ionicons name="call" size={16} color="#FFFFFF" /></View>
              <Text className="text-white font-medium">{contactInfo.phone}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3"><Ionicons name="mail" size={16} color="#FFFFFF" /></View>
              <Text className="text-white font-medium">{contactInfo.email}</Text>
            </View>
          </View>
        </View>

        {/* --- 5. Log Out Button --- */}
        <TouchableOpacity className="bg-red-50 dark:bg-red-900/20 py-4 rounded-2xl flex-row items-center justify-center border border-red-100 dark:border-red-900/30 mb-6 shadow-sm" onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <Text className="text-xl font-bold text-darkBlue dark:text-white mb-4">Edit Profile</Text>
            
            <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Display Name</Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-darkBlue dark:text-white font-medium mb-6"
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
            />

            <View className="flex-row justify-end space-x-3 gap-3">
              <TouchableOpacity 
                className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-700"
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
              >
                <Text className="font-bold text-gray-600 dark:text-gray-300">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="px-6 py-3 rounded-xl bg-primary items-center justify-center"
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="font-bold text-white">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
