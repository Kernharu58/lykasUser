import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { formatDate } from "../../utils/format";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function HealthOverview() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [vetVisits, setVetVisits]     = useState<any[]>([]);
  const [records, setRecords]         = useState<any[]>([]);
  const [shelterSummary, setShelterSummary] = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setError(null);
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
      if (medRes.status === "rejected" && shelterRes.status === "rejected") {
        setError("Could not load health records.");
      }
    } catch (e) {
      console.error(e);
      setError("Could not load health records.");
    }
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
    <SafeAreaView className="flex-1 bg-bgSoft px-6">
      <LoadingState message="Loading health records..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-ink dark:text-white">Health Overview</Text>
          <Text className="text-xs font-bold text-muted">{vaccinations.length} vaccines · {vetVisits.length} vet visits</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={[COLORS.primary]} />}
      >
        {error ? (
          <ErrorState message={error} onAction={fetchAll} />
        ) : null}

        {/* Vaccine countdown */}
        {!error && nextVaccine ? (
          <View className={`rounded-3xl p-5 mb-5 ${daysUntil(nextVaccine.nextDueDate) <= 7 ? "bg-red-500" : "bg-primary"}`}>
            <Text className="text-sm font-bold text-white/80">Next vaccine due</Text>
            <Text className="mt-1 text-4xl font-extrabold text-white">
              {daysUntil(nextVaccine.nextDueDate) <= 0 ? "Overdue!" : `${daysUntil(nextVaccine.nextDueDate)} days`}
            </Text>
            <Text className="mt-2 text-white/90">{nextVaccine.vaccineName} · {formatDate(nextVaccine.nextDueDate)}</Text>
          </View>
        ) : !error ? (
          <View className="rounded-3xl bg-primary p-5 mb-5">
            <Text className="text-sm font-bold text-white/80">Vaccination status</Text>
            <Text className="mt-1 text-2xl font-extrabold text-white">{vaccinations.length > 0 ? "All up to date ✓" : "No records yet"}</Text>
          </View>
        ) : null}

        {/* Quick stats */}
        {!error && <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
            <Text className="text-xs font-bold uppercase text-muted">Weight</Text>
            <Text className="mt-2 text-xl font-extrabold text-ink dark:text-white">{latestWeight || "—"}</Text>
          </View>
          <View className="flex-1 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
            <Text className="text-xs font-bold uppercase text-muted">Condition</Text>
            <Text className="mt-2 text-xl font-extrabold text-ink dark:text-white">{latestCondition || "—"}</Text>
          </View>
          <View className="flex-1 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
            <Text className="text-xs font-bold uppercase text-muted">Records</Text>
            <Text className="mt-2 text-xl font-extrabold text-ink dark:text-white">{records.length}</Text>
          </View>
        </View>}

        {/* Vaccinations */}
        {vaccinations.length > 0 && (
          <>
            <Text className="mb-3 text-xl font-extrabold text-ink dark:text-white">Vaccinations</Text>
            <View className="gap-3 mb-5">
              {vaccinations.map((v) => {
                const isDue = v.nextDueDate && new Date(v.nextDueDate) <= new Date();
                return (
                  <View key={v._id} className="flex-row items-center rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-mintBg">
                      <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="font-extrabold text-ink dark:text-white">{v.vaccineName}</Text>
                      <Text className="text-xs text-muted">Given: {formatDate(v.dateGiven)}</Text>
                      {v.nextDueDate && <Text className="text-xs text-muted">Next: {formatDate(v.nextDueDate)}</Text>}
                    </View>
                    <Text className={`text-xs font-bold ${isDue ? "text-red-500" : "text-primary"}`}>{isDue ? "Overdue" : "Current"}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Vet visits */}
        {vetVisits.length > 0 && (
          <>
            <Text className="mb-3 text-xl font-extrabold text-ink dark:text-white">Vet Visits</Text>
            <View className="gap-3 mb-5">
              {vetVisits.map((v) => (
                <View key={v._id} className="rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
                  <Text className="font-extrabold text-ink dark:text-white">{v.reason}</Text>
                  <Text className="text-xs text-muted mt-1">{formatDate(v.visitDate)} · {v.vetName || "Clinic"}</Text>
                  {v.diagnosis    && <Text className="text-sm text-muted mt-2">Diagnosis: {v.diagnosis}</Text>}
                  {v.treatment    && <Text className="text-sm text-muted">Treatment: {v.treatment}</Text>}
                  {v.followUpDate && <Text className="text-xs text-warning mt-1">Follow-up: {formatDate(v.followUpDate)}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Medical records */}
        {records.length > 0 && (
          <>
            <Text className="mb-3 text-xl font-extrabold text-ink dark:text-white">Medical Records</Text>
            <View className="gap-3 mb-5">
              {records.map((r) => (
                <View key={r._id} className="rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-extrabold text-ink dark:text-white">{r.type}</Text>
                    <Text className="text-xs text-muted">{formatDate(r.date)}</Text>
                  </View>
                  <Text className="text-sm text-muted mt-1">{r.description}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!error && vaccinations.length === 0 && vetVisits.length === 0 && records.length === 0 && (
          <EmptyState
            title="No health records yet"
            message="Records will appear here once added by shelter staff."
            icon="medical-outline"
          />
        )}

        {!error && <TouchableOpacity className="mt-4 rounded-2xl border border-primary py-4" onPress={() => router.push(`/baby-book/${petId}` as any)}>
          <Text className="text-center font-extrabold text-primary">Open Baby Book</Text>
        </TouchableOpacity>}
      </ScrollView>
    </SafeAreaView>
  );
}
