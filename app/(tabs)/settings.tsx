import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

const GREEN = COLORS.primary;

export default function Settings() {
  const router = useRouter();
  const { logout, user, setUser } = useAuth();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({ address: "CarePaws Shelter, Pampanga", phone: "+63 939 268 3311", email: "info@carepaws.org" });

  useEffect(() => {
    const boot = async () => {
      const savedNotifs = await AsyncStorage.getItem("notificationsEnabled");
      if (savedNotifs !== null) setNotificationsEnabled(savedNotifs === "true");
      try {
        const [me, settings] = await Promise.all([api.get("/auth/me"), api.get("/settings")]);
        setDisplayName(me.data.displayName || "");
        setProfilePicture(me.data.profilePicture || null);
        if (me.data.notificationsEnabled !== undefined) setNotificationsEnabled(me.data.notificationsEnabled);
        if (settings.data) setContactInfo({ ...contactInfo, ...settings.data });
      } catch {}
    };
    boot();
  }, []);

  const toggleDarkMode = async (value: boolean) => {
    const theme = value ? "dark" : "light";
    setColorScheme(theme);
    await AsyncStorage.setItem("appTheme", theme);
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem("notificationsEnabled", value.toString());
    try { await api.put("/auth/profile", { notificationsEnabled: value }); } catch {}
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow photo access to update your profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) handleUploadImage(result.assets[0].uri);
  };

  const handleUploadImage = async (uri: string) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("image", { uri, name: filename, type } as any);
      const response = await api.post("/auth/profile-picture", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setProfilePicture(response.data.profilePicture);
    } catch {
      Alert.alert("Upload Failed", "Could not upload the image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Name required", "Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await api.put("/auth/profile", { displayName: editName.trim() });
      const nextName = response.data.user?.displayName || editName.trim();
      setDisplayName(nextName);
      if (user) {
        const nextUser = { ...user, displayName: nextName };
        setUser(nextUser);
        await SecureStore.setItemAsync("userData", JSON.stringify(nextUser));
      }
      setEditModalVisible(false);
    } catch {
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  const initial = displayName?.charAt(0)?.toUpperCase() || "C";

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color={GREEN} />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-gray-900 dark:text-white">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {user && !user.emailVerified && (
          <View className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 flex-row items-start">
            <View className="mr-3 h-9 w-9 rounded-full bg-amber-500 items-center justify-center"><Ionicons name="alert" size={18} color="white" /></View>
            <View className="flex-1">
              <Text className="font-extrabold text-amber-900">Email Not Verified</Text>
              <Text className="mt-1 text-sm leading-5 text-amber-800">Please verify your email address to receive important notifications.</Text>
              <TouchableOpacity className="mt-2" onPress={() => router.push("/verify-email")}><Text className="font-extrabold text-amber-700">Verify Email</Text></TouchableOpacity>
            </View>
          </View>
        )}

        <View className="items-center mb-8">
          <View className="relative">
            <TouchableOpacity className="h-28 w-28 rounded-full bg-primary items-center justify-center overflow-hidden border-4 border-white shadow-sm" onPress={pickImage} disabled={uploadingImage}>
              {uploadingImage ? <ActivityIndicator color="white" /> : profilePicture ? <Image source={{ uri: profilePicture }} className="h-full w-full" resizeMode="cover" /> : <Text className="text-4xl font-extrabold text-white">{initial}</Text>}
            </TouchableOpacity>
            <TouchableOpacity className="absolute bottom-1 right-0 h-10 w-10 rounded-full bg-white border border-border items-center justify-center shadow-sm" onPress={pickImage}>
              <Ionicons name="camera" size={18} color={GREEN} />
            </TouchableOpacity>
          </View>
          <View className="mt-4 flex-row items-center">
            <Text className="text-3xl font-extrabold text-gray-900 dark:text-white">{displayName || "CarePaws User"}</Text>
            <TouchableOpacity className="ml-3 h-9 w-9 rounded-full bg-mintBg items-center justify-center" onPress={() => { setEditName(displayName); setEditModalVisible(true); }}>
              <Ionicons name="pencil" size={16} color={GREEN} />
            </TouchableOpacity>
          </View>
          <Text className="mt-1 text-sm font-medium text-gray-500">Pet Parent in Pampanga</Text>
        </View>

        <View className="rounded-3xl bg-white p-2 shadow-sm border border-border dark:bg-gray-800 dark:border-gray-700 mb-6">
          {[
            { label: "My Applications", icon: "clipboard-outline", path: "/(tabs)/my-applications" },
            { label: "Saved Pets", icon: "heart-outline", path: "/(tabs)/favorites" },
            { label: "My Pets", icon: "paw-outline", path: "/my-pets" },
            { label: "Messages", icon: "chatbubbles-outline", path: "/(tabs)/chat" },
          ].map((item, index) => (
            <TouchableOpacity key={item.label} className={`flex-row items-center justify-between p-4 ${index !== 3 ? "border-b border-gray100" : ""}`} onPress={() => router.push(item.path as any)}>
              <View className="flex-row items-center"><View className="mr-4 h-11 w-11 rounded-full bg-mintBg items-center justify-center"><Ionicons name={item.icon as any} size={21} color={GREEN} /></View><Text className="text-base font-extrabold text-gray-900 dark:text-white">{item.label}</Text></View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.mutedLight} />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mb-3 ml-1 text-xs font-extrabold uppercase tracking-widest text-gray-400">Preferences</Text>
        <View className="rounded-3xl bg-white p-5 shadow-sm border border-border dark:bg-gray-800 dark:border-gray-700 mb-6">
          <View className="flex-row justify-between items-center mb-5 pb-5 border-b border-gray100">
            <View className="flex-row items-center"><View className="mr-4 h-11 w-11 rounded-full bg-mintBg items-center justify-center"><Ionicons name="notifications-outline" size={21} color={GREEN} /></View><Text className="text-base font-extrabold text-gray-900 dark:text-white">Push Notifications</Text></View>
            <Switch value={notificationsEnabled} onValueChange={handleToggleNotifications} trackColor={{ false: COLORS.gray200, true: COLORS.mintLight }} thumbColor={notificationsEnabled ? GREEN : COLORS.gray50} />
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center"><View className="mr-4 h-11 w-11 rounded-full bg-mintBg items-center justify-center"><Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={21} color={GREEN} /></View><Text className="text-base font-extrabold text-gray-900 dark:text-white">Dark Mode</Text></View>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: COLORS.gray200, true: COLORS.mintLight }} thumbColor={isDarkMode ? GREEN : COLORS.gray50} />
          </View>
        </View>

        <View className="rounded-3xl bg-primary p-6 mb-6">
          <Text className="text-xl font-extrabold text-white">Get in Touch</Text>
          <Text className="mt-1 mb-5 text-sm text-white/80">We&apos;re here to help you and your pets.</Text>
          <Text className="text-white font-semibold mb-2">{contactInfo.address}</Text>
          <Text className="text-white font-semibold mb-2">{contactInfo.phone}</Text>
          <Text className="text-white font-semibold">{contactInfo.email}</Text>
        </View>

        <TouchableOpacity className="mb-6 rounded-2xl border border-red-100 bg-red-50 py-4 flex-row items-center justify-center" onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
          <Text className="ml-2 text-base font-extrabold text-red-500">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <Text className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Edit Profile</Text>
            <Text className="text-sm font-bold text-gray-500 mb-2 ml-1">Display Name</Text>
            <TextInput className="bg-bgSoft border border-border rounded-2xl px-4 py-3 text-gray-900 mb-6" value={editName} onChangeText={setEditName} placeholder="Enter your name" placeholderTextColor={COLORS.mutedLight} />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity className="px-5 py-3 rounded-xl bg-gray-100" onPress={() => setEditModalVisible(false)} disabled={isSaving}><Text className="font-bold text-gray-600">Cancel</Text></TouchableOpacity>
              <TouchableOpacity className="px-6 py-3 rounded-xl bg-primary items-center justify-center" onPress={handleSaveProfile} disabled={isSaving}>{isSaving ? <ActivityIndicator color="white" size="small" /> : <Text className="font-bold text-white">Save</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
