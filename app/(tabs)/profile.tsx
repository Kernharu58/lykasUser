import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const sections = [
  { title: "My Applications",  subtitle: "Track adoption and foster reviews",        icon: "clipboard-outline",      path: "/(tabs)/my-applications" },
  { title: "My Pets",          subtitle: "Baby book and health updates",             icon: "paw-outline",            path: "/my-pets" },
  { title: "Foster Trial",     subtitle: "Reports, reminders, and staff check-ins",  icon: "home-outline",           path: "/foster-dashboard" },
  { title: "My Documents",     subtitle: "Verification status and uploads",          icon: "document-text-outline",  path: "/documents" },
  { title: "Payments",         subtitle: "Adoption fees and receipts",               icon: "card-outline",           path: "/payments" },
  { title: "Saved Pets",       subtitle: "Pets you want to revisit",                icon: "heart-outline",          path: "/(tabs)/favorites" },
  { title: "Compare Pets",     subtitle: "Review saved pets side by side",          icon: "git-compare-outline",    path: "/compare-pets" },
  { title: "Donation History", subtitle: "Receipts and past gifts",                 icon: "receipt-outline",        path: "/donate" },
  { title: "Volunteer Portal", subtitle: "Visits, events, attendance, and reports",  icon: "people-outline",         path: "/volunteer-portal" },
  { title: "Report Concern",   subtitle: "Emergency welfare reporting",              icon: "alert-circle-outline",   path: "/emergency-report" },
  { title: "Messages",         subtitle: "Chat with shelter staff",                 icon: "chatbubbles-outline",    path: "/(tabs)/chat" },
  { title: "Settings",         subtitle: "Account, security, privacy",              icon: "settings-outline",       path: "/(tabs)/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();

  const [stats, setStats]         = useState({ totalApps: 0, approved: 0, foster: 0, compliance: "—" });
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit mode
  const [editMode, setEditMode]   = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving]       = useState(false);

  const fetchStats = async () => {
    try {
      const [appRes, fosterRes, profileRes] = await Promise.allSettled([
        api.get("/applications/my"),
        api.get("/foster/my"),
        api.get("/auth/me"),   // assumes auth/me endpoint returns current user
      ]);

      let totalApps = 0, approved = 0;
      if (appRes.status === "fulfilled") {
        const apps = appRes.value.data || [];
        totalApps = apps.length;
        approved  = apps.filter((a: any) => a.status === "approved").length;
      }

      let fosterCount = 0;
      if (fosterRes.status === "fulfilled") {
        fosterCount = (fosterRes.value.data || []).length;
      }

      if (profileRes.status === "fulfilled") {
        const u = profileRes.value.data?.user || profileRes.value.data;
        if (u) {
          setUser(u);
          setDisplayName(u.displayName || "");
        }
      }

      setStats({ totalApps, approved, foster: fosterCount, compliance: approved > 0 ? "Active" : "—" });
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const handleSave = async () => {
    if (!displayName.trim()) { Alert.alert("Required", "Name cannot be empty."); return; }
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", { displayName: displayName.trim() });
      const updated = res.data?.user || res.data;
      if (updated) setUser(updated);
      setEditMode(false);
      Alert.alert("Updated!", "Your profile has been updated.");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not update profile.");
    } finally { setSaving(false); }
  };

  const initial = (user?.displayName || "C").charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} colors={["#1E6B45"]} />}
      >
        {/* Avatar + name */}
        <View className="mt-6 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#1E6B45] shadow-sm">
            <Text className="text-4xl font-extrabold text-white">{initial}</Text>
          </View>

          {editMode ? (
            <View className="mt-4 w-full items-center gap-3">
              <TextInput value={displayName} onChangeText={setDisplayName}
                placeholder="Display name" placeholderTextColor="#9CA3AF"
                className="w-full rounded-2xl border border-[#DCE8E1] bg-white px-4 py-3 text-center text-xl font-extrabold text-[#111827] dark:bg-gray-800 dark:text-white" />
              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 rounded-2xl border border-[#DCE8E1] py-3" onPress={() => { setEditMode(false); setDisplayName(user?.displayName || ""); }}>
                  <Text className="text-center font-bold text-[#6B7280]">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 rounded-2xl bg-[#1E6B45] py-3" onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-center font-bold text-white">Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="mt-4 items-center">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-extrabold text-[#111827] dark:text-white">{user?.displayName || "CarePaws User"}</Text>
                <TouchableOpacity onPress={() => setEditMode(true)}>
                  <Ionicons name="pencil-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text className="mt-1 text-sm font-medium text-[#6B7280] dark:text-gray-400">{user?.email}</Text>
              <View className="mt-2 rounded-full bg-[#EAF4EE] px-3 py-1">
                <Text className="text-xs font-bold text-[#3D8A5E]">Verified pet parent</Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats card */}
        <View className="mt-7 rounded-3xl border border-[#DCE8E1] bg-white p-5 dark:bg-gray-800 dark:border-gray-700">
          <Text className="text-lg font-extrabold text-[#111827] dark:text-white">Care progress</Text>
          {loading ? <ActivityIndicator color="#1E6B45" className="mt-4" /> : (
            <View className="mt-4 flex-row justify-between">
              {[
                [String(stats.totalApps), "Total Apps"],
                [String(stats.approved),  "Approved"],
                [String(stats.foster),    "Foster"],
                [stats.compliance,        "Status"],
              ].map(([value, label]) => (
                <View key={label} className="items-center">
                  <Text className="text-2xl font-extrabold text-[#1E6B45]">{value}</Text>
                  <Text className="text-xs font-bold text-[#6B7280]">{label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Nav sections */}
        <View className="mt-6 gap-3">
          {sections.map((item) => (
            <TouchableOpacity key={item.title}
              className="flex-row items-center rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800 dark:border-gray-700"
              onPress={() => router.push(item.path as any)}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EAF4EE]">
                <Ionicons name={item.icon as any} size={22} color="#1E6B45" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-extrabold text-[#111827] dark:text-white">{item.title}</Text>
                <Text className="text-sm text-[#6B7280] dark:text-gray-400">{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B0A898" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="mt-6 rounded-2xl border border-red-100 bg-red-50 py-4 dark:bg-red-900/20 dark:border-red-900/30" onPress={logout}>
          <Text className="text-center font-extrabold text-red-500">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
