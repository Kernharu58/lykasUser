import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function HealthOverview() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const [summary, setSummary]         = useState<any>(null);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [vetVisits, setVetVisits]     = useState<any[]>([]);
  const [records, setRecords]         = useState<any[]>([]);
  const [shelterSummary, setShelterSummary] = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchAll = async () => {
    try {
      const [medRes, shelterRes] = await Promise.allSettled([
        api.get(`/medical/summary/${petId}`),
        api.get(`/shelter-care/summary/${petId}`),
      ]);
      if (medRes.status === "fulfilled") {
        setVaccinations(medRes.value.data.vaccinations || []);
        setVetVisits(medRes.value.data.vetVisits || []);
        setRecords(medRes.value.data.medicalRecords || []);
      }
      if (shelterRes.status === "fulfilled") setShelterSummary(shelterRes.value.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, [petId]));

  // Find next due vaccine
  const nextVaccine = vaccinations
    .filter(v => v.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];

  const latestWeight = shelterSummary?.latestHealth?.weight;
  const latestCondition = shelterSummary?.latestHealth?.condition;

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <ActivityIndicator size="large" color="#1E6B45" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-[#111827] dark:text-white">Health Overview</Text>
          <Text className="text-xs font-bold text-[#6B7280]">{vaccinations.length} vaccines · {vetVisits.length} vet visits</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={["#1E6B45"]} />}
      >
        {/* Vaccine countdown */}
        {nextVaccine ? (
          <View className={`rounded-3xl p-5 mb-5 ${daysUntil(nextVaccine.nextDueDate) <= 7 ? "bg-red-500" : "bg-[#1E6B45]"}`}>
            <Text className="text-sm font-bold text-white/80">Next vaccine due</Text>
            <Text className="mt-1 text-4xl font-extrabold text-white">
              {daysUntil(nextVaccine.nextDueDate) <= 0 ? "Overdue!" : `${daysUntil(nextVaccine.nextDueDate)} days`}
            </Text>
            <Text className="mt-2 text-white/90">{nextVaccine.vaccineName} · {new Date(nextVaccine.nextDueDate).toLocaleDateString()}</Text>
          </View>
        ) : (
          <View className="rounded-3xl bg-[#1E6B45] p-5 mb-5">
            <Text className="text-sm font-bold text-white/80">Vaccination status</Text>
            <Text className="mt-1 text-2xl font-extrabold text-white">{vaccinations.length > 0 ? "All up to date ✓" : "No records yet"}</Text>
          </View>
        )}

        {/* Quick stats */}
        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
            <Text className="text-xs font-bold uppercase text-[#6B7280]">Weight</Text>
            <Text className="mt-2 text-xl font-extrabold text-[#111827] dark:text-white">{latestWeight || "—"}</Text>
          </View>
          <View className="flex-1 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
            <Text className="text-xs font-bold uppercase text-[#6B7280]">Condition</Text>
            <Text className="mt-2 text-xl font-extrabold text-[#111827] dark:text-white">{latestCondition || "—"}</Text>
          </View>
          <View className="flex-1 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
            <Text className="text-xs font-bold uppercase text-[#6B7280]">Records</Text>
            <Text className="mt-2 text-xl font-extrabold text-[#111827] dark:text-white">{records.length}</Text>
          </View>
        </View>

        {/* Vaccinations */}
        {vaccinations.length > 0 && (
          <>
            <Text className="mb-3 text-xl font-extrabold text-[#111827] dark:text-white">Vaccinations</Text>
            <View className="gap-3 mb-5">
              {vaccinations.map((v) => {
                const isDue = v.nextDueDate && new Date(v.nextDueDate) <= new Date();
                return (
                  <View key={v._id} className="flex-row items-center rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EAF4EE]">
                      <Ionicons name="shield-checkmark-outline" size={20} color="#1E6B45" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="font-extrabold text-[#111827] dark:text-white">{v.vaccineName}</Text>
                      <Text className="text-xs text-[#6B7280]">Given: {new Date(v.dateGiven).toLocaleDateString()}</Text>
                      {v.nextDueDate && <Text className="text-xs text-[#6B7280]">Next: {new Date(v.nextDueDate).toLocaleDateString()}</Text>}
                    </View>
                    <Text className={`text-xs font-bold ${isDue ? "text-red-500" : "text-[#1E6B45]"}`}>{isDue ? "Overdue" : "Current"}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Vet visits */}
        {vetVisits.length > 0 && (
          <>
            <Text className="mb-3 text-xl font-extrabold text-[#111827] dark:text-white">Vet Visits</Text>
            <View className="gap-3 mb-5">
              {vetVisits.map((v) => (
                <View key={v._id} className="rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                  <Text className="font-extrabold text-[#111827] dark:text-white">{v.reason}</Text>
                  <Text className="text-xs text-[#6B7280] mt-1">{new Date(v.visitDate).toLocaleDateString()} · {v.vetName || "Clinic"}</Text>
                  {v.diagnosis    && <Text className="text-sm text-[#6B7280] mt-2">Diagnosis: {v.diagnosis}</Text>}
                  {v.treatment    && <Text className="text-sm text-[#6B7280]">Treatment: {v.treatment}</Text>}
                  {v.followUpDate && <Text className="text-xs text-[#E8A020] mt-1">Follow-up: {new Date(v.followUpDate).toLocaleDateString()}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Medical records */}
        {records.length > 0 && (
          <>
            <Text className="mb-3 text-xl font-extrabold text-[#111827] dark:text-white">Medical Records</Text>
            <View className="gap-3 mb-5">
              {records.map((r) => (
                <View key={r._id} className="rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-extrabold text-[#111827] dark:text-white">{r.type}</Text>
                    <Text className="text-xs text-[#6B7280]">{new Date(r.date).toLocaleDateString()}</Text>
                  </View>
                  <Text className="text-sm text-[#6B7280] mt-1">{r.description}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {vaccinations.length === 0 && vetVisits.length === 0 && records.length === 0 && (
          <View className="items-center mt-10">
            <Ionicons name="medical-outline" size={56} color="#DCE8E1" />
            <Text className="mt-4 font-extrabold text-[#111827] dark:text-white">No health records yet</Text>
            <Text className="mt-2 text-sm text-[#6B7280] text-center">Records will appear here once added by shelter staff.</Text>
          </View>
        )}

        <TouchableOpacity className="mt-4 rounded-2xl border border-[#1E6B45] py-4" onPress={() => router.push(`/baby-book/${petId}` as any)}>
          <Text className="text-center font-extrabold text-[#1E6B45]">Open Baby Book</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
