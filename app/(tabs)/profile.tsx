import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

const sections = [
  { title: "My Applications",  subtitle: "Track adoption and foster reviews",        icon: "clipboard-outline",      path: "/(tabs)/my-applications" },
  { title: "My Pets",          subtitle: "Baby book and health updates",             icon: "paw-outline",            path: "/my-pets" },
  { title: "Foster Trial",     subtitle: "Reports, reminders, and staff check-ins",  icon: "home-outline",           path: "/foster-dashboard" },
  { title: "My Documents",     subtitle: "Verification status and uploads",          icon: "document-text-outline",  path: "/documents" },
  { title: "Payments",         subtitle: "Donation receipts and history",            icon: "card-outline",           path: "/payments" },
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
  const { user, setUser } = useAuth();

  const [stats, setStats]               = useState({ totalApps: 0, approved: 0, foster: 0, compliance: "—" });
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [fetchError, setFetchError]     = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const fetchStats = async () => {
    setFetchError(false);
    try {
      const [appRes, fosterRes, profileRes] = await Promise.allSettled([
        api.get("/applications/my"),
        api.get("/foster/my"),
        api.get("/auth/me"),
      ]);

      if ([appRes, fosterRes, profileRes].every(r => r.status === "rejected")) {
        setFetchError(true);
      }

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
          if (u.profilePicture) setProfilePicture(u.profilePicture);
        }
      }

      setStats({ totalApps, approved, foster: fosterCount, compliance: approved > 0 ? "Active" : "—" });
    } catch (e) {
      console.error("[Profile] fetchStats unexpected error:", e);
      setFetchError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const initial = (user?.displayName || "C").charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 155 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchStats(); }}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Avatar + name */}
        <View className="mt-6 items-center">
          <View className="h-24 w-24 rounded-full bg-primary items-center justify-center overflow-hidden border-4 border-white shadow-sm">
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-4xl font-extrabold text-white">{initial}</Text>
            )}
          </View>

          <View className="mt-4 items-center">
            <Text className="text-2xl font-extrabold text-ink dark:text-white">
              {user?.displayName || "CarePaws User"}
            </Text>
            <Text className="mt-1 text-sm font-medium text-muted dark:text-gray-400">{user?.email}</Text>
            <View className="mt-2 rounded-full bg-mintBg px-3 py-1">
              <Text className="text-xs font-bold text-mintDeep">Verified pet parent</Text>
            </View>
          </View>
        </View>

        {/* Connection error banner */}
        {fetchError && (
          <View className="mt-5 flex-row items-center rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Ionicons name="wifi-outline" size={20} color={COLORS.warning} />
            <Text className="ml-3 flex-1 text-sm font-bold text-amber-800">
              Could not load your data. Pull down to retry.
            </Text>
          </View>
        )}

        {/* Stats card */}
        <View className="mt-7 rounded-3xl border border-border bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <Text className="text-lg font-extrabold text-ink dark:text-white">Care progress</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} className="mt-4" />
          ) : (
            <View className="mt-4 flex-row justify-between">
              {[
                [String(stats.totalApps), "Total Apps"],
                [String(stats.approved),  "Approved"],
                [String(stats.foster),    "Foster"],
                [stats.compliance,        "Status"],
              ].map(([value, label]) => (
                <View key={label} className="items-center">
                  <Text className="text-2xl font-extrabold text-primary">{value}</Text>
                  <Text className="text-xs font-bold text-muted">{label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Nav sections */}
        <View className="mt-6 flex-row flex-wrap justify-between">
          {sections.map((item) => (
            <TouchableOpacity
            key={item.title}
            className="mb-3 w-[48%] items-center rounded-3xl border border-border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            onPress={() => router.push(item.path as any)}
          >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-mintBg">
  <Ionicons
    name={item.icon as any}
    size={22}
    color={COLORS.primary}
  />
</View>

<Text className="mt-3 text-center font-extrabold text-ink dark:text-white">
  {item.title}
</Text>

<Text className="mt-1 text-center text-xs text-muted dark:text-gray-400">
  {item.subtitle}
</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
