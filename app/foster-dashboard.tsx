import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

const TRACKER = ["Day 1 Intake", "Week 1 Report", "Week 2 Check-In", "Week 3 Report", "Final Review"];

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function FosterDashboard() {
  const router = useRouter();
  const [fosters, setFosters] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/foster/my");
      setFosters(res.data);
      // Load reports for the first active foster
      const active = res.data.find((f: any) => f.status === "active");
      if (active) {
        const rRes = await api.get(`/foster/${active._id}/reports`);
        setReports(rRes.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <ActivityIndicator size="large" color="#1E6B45" />
    </SafeAreaView>
  );

  const activeFoster = fosters.find(f => f.status === "active");

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#111827] dark:text-white">My Foster Trial</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={["#1E6B45"]} />}
      >
        {!activeFoster ? (
          <View className="items-center mt-16">
            <Ionicons name="home-outline" size={64} color="#DCE8E1" />
            <Text className="mt-4 text-lg font-extrabold text-[#111827] dark:text-white">No active foster placement</Text>
            <Text className="mt-2 text-sm text-[#6B7280] text-center">Your foster placements will appear here once assigned by staff.</Text>
          </View>
        ) : (
          <>
            <View className="rounded-3xl bg-[#1E6B45] p-5">
              <Text className="text-sm font-bold text-white/80">{activeFoster.pet?.name} foster trial</Text>
              <Text className="mt-1 text-4xl font-extrabold text-white">
                {activeFoster.expectedEndDate ? `${daysLeft(activeFoster.expectedEndDate)} days left` : "Active"}
              </Text>
              <Text className="mt-2 text-white/90">
                Started {new Date(activeFoster.startDate).toLocaleDateString()}
                {activeFoster.expectedEndDate ? ` · ends ${new Date(activeFoster.expectedEndDate).toLocaleDateString()}` : ""}
              </Text>
            </View>

            <View className="mt-5 flex-row gap-3">
              <View className="flex-1 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                <Text className="text-xs font-bold uppercase text-[#6B7280]">Reports submitted</Text>
                <Text className="mt-2 text-lg font-extrabold text-[#111827] dark:text-white">{reports.length}</Text>
              </View>
              <View className="flex-1 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                <Text className="text-xs font-bold uppercase text-[#6B7280]">Agreement</Text>
                <Text className="mt-2 text-lg font-extrabold text-[#111827] dark:text-white">{activeFoster.fosterAgreementSigned ? "Signed" : "Pending"}</Text>
              </View>
            </View>

            <Text className="mt-7 mb-3 text-xl font-extrabold text-[#111827] dark:text-white">Foster Progress</Text>
            <View className="gap-3">
              {TRACKER.map((item, index) => (
                <View key={item} className="flex-row items-center rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                  <View className={`h-10 w-10 items-center justify-center rounded-full ${index < reports.length ? "bg-[#1E6B45]" : "bg-[#EAF4EE]"}`}>
                    <Ionicons name={index < reports.length ? "checkmark" : "time-outline"} size={20} color={index < reports.length ? "white" : "#1E6B45"} />
                  </View>
                  <Text className="ml-4 font-bold text-[#111827] dark:text-white">{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity className="mt-6 rounded-2xl bg-[#1E6B45] py-4"
              onPress={() => router.push("/monitoring-report" as any)}>
              <Text className="text-center font-extrabold text-white">Submit Weekly Report</Text>
            </TouchableOpacity>
          </>
        )}

        {fosters.filter(f => f.status !== "active").length > 0 && (
          <>
            <Text className="mt-7 mb-3 text-xl font-extrabold text-[#111827] dark:text-white">Past Fosters</Text>
            {fosters.filter(f => f.status !== "active").map(f => (
              <View key={f._id} className="mb-3 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                <Text className="font-extrabold text-[#111827] dark:text-white">{f.pet?.name}</Text>
                <Text className="text-sm text-[#6B7280] capitalize">{f.status} · {new Date(f.startDate).toLocaleDateString()}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}