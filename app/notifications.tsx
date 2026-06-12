import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

const filters = ["All", "Applications", "Messages", "Payments", "Events"];

const iconMap: Record<string, string> = {
  APPLICATION_APPROVED: "clipboard-outline",
  APPLICATION_REJECTED: "clipboard-outline",
  APPLICATION_SUBMITTED: "clipboard-outline",
  INTERVIEW_SCHEDULED: "calendar-outline",
  INTERVIEW_RESCHEDULED: "calendar-outline",
  INTERVIEW_RESULT: "checkmark-circle-outline",
  HOME_VISIT_SCHEDULED: "home-outline",
  HOME_VISIT_RESULT: "home-outline",
  FOSTER_STARTED: "paw-outline",
  FOSTER_ENDED: "paw-outline",
  MONITORING_REPORT_REVIEWED: "document-text-outline",
  MONITORING_REPORT_FLAGGED: "warning-outline",
  PAYMENT_RECEIVED: "card-outline",
  PAYMENT_FAILED: "card-outline",
  EVENT_CREATED: "calendar-outline",
  EVENT_REMINDER: "calendar-outline",
  GENERAL: "notifications-outline",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const deleteAll = async () => {
    Alert.alert("Clear All", "Delete all notifications?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        try {
          await api.delete("/notifications");
          setNotifications([]);
        } catch (e) { console.error(e); }
      }},
    ]);
  };

  const visible = filter === "All" ? notifications
    : notifications.filter(n => {
        const t = n.type || "";
        if (filter === "Applications") return t.includes("APPLICATION") || t.includes("INTERVIEW") || t.includes("HOME_VISIT");
        if (filter === "Payments") return t.includes("PAYMENT");
        if (filter === "Events") return t.includes("EVENT");
        if (filter === "Messages") return t === "GENERAL";
        return true;
      });

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] items-center justify-center">
      <ActivityIndicator size="large" color="#D4622A" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E8E4DC] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#D4622A" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#2C2C2C] dark:text-white">Notifications</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} colors={["#D4622A"]} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {filters.map((item) => (
              <TouchableOpacity key={item} onPress={() => setFilter(item)}
                className={`rounded-full px-4 py-2 ${filter === item ? "bg-[#D4622A]" : "bg-white border border-[#E8E4DC] dark:bg-gray-800"}`}>
                <Text className={`text-xs font-extrabold ${filter === item ? "text-white" : "text-[#7A7068] dark:text-gray-300"}`}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="mb-4 flex-row gap-3">
          <TouchableOpacity className="flex-1 rounded-2xl bg-[#EAF4EE] py-3" onPress={markAllRead}>
            <Text className="text-center font-extrabold text-[#1E6B45]">Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 rounded-2xl bg-red-50 py-3" onPress={deleteAll}>
            <Text className="text-center font-extrabold text-red-500">Clear All</Text>
          </TouchableOpacity>
        </View>

        {visible.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="notifications-off-outline" size={64} color="#E8E4DC" />
            <Text className="mt-4 text-lg font-extrabold text-[#2C2C2C] dark:text-white">No notifications</Text>
          </View>
        ) : (
          <View className="gap-3">
            {visible.map((item) => (
              <TouchableOpacity key={item._id}
                className={`rounded-3xl border bg-white p-4 shadow-sm dark:bg-gray-800 ${!item.isRead ? "border-[#D4622A]" : "border-[#E8E4DC] dark:border-gray-700"}`}
                onPress={() => markRead(item._id)}>
                <View className="flex-row items-start">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5EDD6]">
                    <Ionicons name={(iconMap[item.type] || "notifications-outline") as any} size={22} color="#D4622A" />
                  </View>
                  <View className="ml-4 flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-extrabold text-[#2C2C2C] dark:text-white flex-1 mr-2">{item.title}</Text>
                      {!item.isRead && <View className="h-2.5 w-2.5 rounded-full bg-[#D4622A]" />}
                    </View>
                    <Text className="mt-1 text-sm leading-5 text-[#7A7068] dark:text-gray-400">{item.message}</Text>
                    <Text className="mt-2 text-xs font-bold text-[#B0A898]">{timeAgo(item.createdAt)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}