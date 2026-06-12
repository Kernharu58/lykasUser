import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

export default function VolunteerPortal() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, assignRes] = await Promise.allSettled([
        api.get("/volunteers/me"),
        api.get("/event-assignments/my"),
      ]);
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
      if (assignRes.status === "fulfilled") setAssignments(assignRes.value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleRegister = async () => {
    Alert.alert("Volunteer Registration", "Would you like to register as a volunteer?", [
      { text: "Cancel", style: "cancel" },
      { text: "Register", onPress: async () => {
        setRegistering(true);
        try {
          await api.post("/volunteers/register", { motivation: "I want to help animals." });
          Alert.alert("Success!", "Your volunteer application has been submitted. Staff will review it shortly.");
          fetchData();
        } catch (err: any) {
          Alert.alert("Error", err.response?.data?.message || "Could not register.");
        } finally { setRegistering(false); }
      }},
    ]);
  };

  const confirmAssignment = async (id: string) => {
    try {
      await api.put(`/event-assignments/${id}/confirm`);
      setAssignments(prev => prev.map(a => a._id === id ? { ...a, status: "confirmed" } : a));
      Alert.alert("Confirmed!", "You have confirmed your event assignment.");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not confirm.");
    }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <ActivityIndicator size="large" color="#1E6B45" />
    </SafeAreaView>
  );

  const statusColor: Record<string, string> = { approved: "#1E6B45", pending: "#E8A020", rejected: "#EF4444", inactive: "#6B7280" };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#111827] dark:text-white">Volunteer Portal</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={["#1E6B45"]} />}
      >
        {!profile ? (
          <View className="items-center mt-16">
            <Ionicons name="people-outline" size={64} color="#DCE8E1" />
            <Text className="mt-4 text-lg font-extrabold text-[#111827] dark:text-white">Not registered as a volunteer</Text>
            <Text className="mt-2 text-sm text-[#6B7280] text-center">Join our volunteer team and help animals find their forever homes.</Text>
            <TouchableOpacity className="mt-6 rounded-2xl bg-[#1E6B45] px-8 py-4" onPress={handleRegister} disabled={registering}>
              {registering ? <ActivityIndicator color="#fff" /> : <Text className="font-extrabold text-white">Register as Volunteer</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="rounded-3xl bg-[#1E6B45] p-5">
              <Text className="text-sm font-bold text-white/80">Volunteer dashboard</Text>
              <Text className="mt-1 text-2xl font-extrabold text-white">{assignments.filter(a => a.status !== "cancelled").length} active assignments</Text>
              <View className="mt-3 flex-row items-center">
                <View className="rounded-full px-3 py-1 mr-2" style={{ backgroundColor: statusColor[profile.status] + "30" }}>
                  <Text className="text-xs font-bold capitalize text-white">{profile.status}</Text>
                </View>
                <Text className="text-white/80 text-sm">{profile.totalHours || 0} total hours</Text>
              </View>
            </View>

            <View className="mt-5 flex-row gap-3">
              <View className="flex-1 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                <Text className="text-xs font-bold uppercase text-[#6B7280]">Total Hours</Text>
                <Text className="mt-2 text-xl font-extrabold text-[#111827] dark:text-white">{profile.totalHours || 0}</Text>
              </View>
              <View className="flex-1 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                <Text className="text-xs font-bold uppercase text-[#6B7280]">Events</Text>
                <Text className="mt-2 text-xl font-extrabold text-[#111827] dark:text-white">{assignments.length}</Text>
              </View>
            </View>

            <Text className="mt-7 mb-3 text-xl font-extrabold text-[#111827] dark:text-white">My Assignments</Text>
            {assignments.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="calendar-outline" size={48} color="#DCE8E1" />
                <Text className="mt-3 text-[#6B7280]">No assignments yet.</Text>
              </View>
            ) : (
              <View className="gap-3">
                {assignments.map(a => (
                  <View key={a._id} className="rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                    <Text className="font-extrabold text-[#111827] dark:text-white">{a.event?.title || "Event"}</Text>
                    <Text className="text-sm text-[#6B7280] mt-1">{a.role || "Volunteer"}</Text>
                    {a.event?.date && <Text className="text-xs text-[#B0A898] mt-1">{new Date(a.event.date).toLocaleDateString()}</Text>}
                    <View className="flex-row items-center justify-between mt-3">
                      <View className="rounded-full px-3 py-1 bg-[#EAF4EE]">
                        <Text className="text-xs font-bold capitalize text-[#1E6B45]">{a.status}</Text>
                      </View>
                      {a.status === "assigned" && (
                        <TouchableOpacity className="rounded-xl bg-[#1E6B45] px-4 py-2" onPress={() => confirmAssignment(a._id)}>
                          <Text className="text-xs font-bold text-white">Confirm</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}