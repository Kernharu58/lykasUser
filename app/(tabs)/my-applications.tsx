import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";

const statusColor: Record<string, string> = {
  pending:  "#E8A020",
  approved: "#1E6B45",
  rejected: "#EF4444",
};
const statusBg: Record<string, string> = {
  pending:  "#FEF3E2",
  approved: "#EAF4EE",
  rejected: "#FEE2E2",
};

function progressFromStatus(status: string) {
  if (status === "approved") return 100;
  if (status === "rejected") return 100;
  return 40;
}

function stepLabel(status: string) {
  if (status === "approved") return "Application approved";
  if (status === "rejected") return "Application not approved";
  return "Under review by staff";
}

export default function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications/my");
      setApplications(res.data);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not load applications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchApplications(); }, []));

  const handleCancel = async (id: string) => {
    Alert.alert("Cancel Application", "Are you sure you want to withdraw this application?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel", style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/applications/${id}`);
            setApplications(prev => prev.filter(a => a._id !== id));
            Alert.alert("Cancelled", "Your application has been withdrawn.");
          } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Could not cancel.");
          }
        },
      },
    ]);
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <ActivityIndicator size="large" color="#1E6B45" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} colors={["#1E6B45"]} />}
      >
        <View className="mt-4 mb-6">
          <Text className="text-3xl font-extrabold text-[#111827] dark:text-white">My Applications</Text>
          <Text className="text-[#6B7280] dark:text-gray-400 mt-2">Transparent status tracking from submission to decision.</Text>
        </View>

        {applications.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="clipboard-outline" size={64} color="#DCE8E1" />
            <Text className="mt-4 text-lg font-extrabold text-[#111827] dark:text-white">No applications yet</Text>
            <Text className="mt-2 text-sm text-[#6B7280] text-center">Browse pets and apply for adoption to get started.</Text>
            <TouchableOpacity className="mt-6 rounded-2xl bg-[#1E6B45] px-8 py-4" onPress={() => router.push("/(tabs)/adopt" as any)}>
              <Text className="font-extrabold text-white">Browse Pets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4">
            {applications.map((app) => {
              const status = app.status || "pending";
              const progress = progressFromStatus(status);
              return (
                <TouchableOpacity key={app._id} className="rounded-3xl border border-[#DCE8E1] bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700"
                  onPress={() => router.push(`/application-details/${app._id}` as any)}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-xs font-bold uppercase tracking-widest text-[#B0A898]">{app._id?.slice(-8).toUpperCase()}</Text>
                      <Text className="mt-2 text-xl font-extrabold text-[#111827] dark:text-white">{app.pet?.name || "Pet"}</Text>
                      <Text className="text-sm text-[#6B7280] dark:text-gray-400">{app.pet?.species} • Adoption application</Text>
                    </View>
                    <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusBg[status] }}>
                      <Text className="text-xs font-bold capitalize" style={{ color: statusColor[status] }}>{status}</Text>
                    </View>
                  </View>

                  <View className="mt-5">
                    <View className="mb-2 flex-row justify-between">
                      <Text className="text-sm font-bold text-[#111827] dark:text-white">{stepLabel(status)}</Text>
                      <Text className="text-sm font-bold text-[#1E6B45]">{progress}%</Text>
                    </View>
                    <View className="h-3 rounded-full bg-[#F4F2EE] dark:bg-gray-700">
                      <View className="h-3 rounded-full bg-[#1E6B45]" style={{ width: `${progress}%` }} />
                    </View>
                  </View>

                  {status === "pending" && (
                    <TouchableOpacity className="mt-4 rounded-xl border border-red-200 bg-red-50 py-3"
                      onPress={() => handleCancel(app._id)}>
                      <Text className="text-center font-bold text-red-500">Withdraw Application</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity className="flex-1 rounded-2xl bg-[#1E6B45] py-4" onPress={() => router.push("/foster-dashboard" as any)}>
            <Text className="text-center font-extrabold text-white">Foster Trial</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 rounded-2xl border border-[#1E6B45] py-4" onPress={() => router.push("/documents" as any)}>
            <Text className="text-center font-extrabold text-[#1E6B45]">Documents</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}