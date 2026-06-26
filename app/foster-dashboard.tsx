import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert, RefreshControl, ScrollView,
  Text, TextInput, TouchableOpacity, View, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function trialProgress(foster: any) {
  if (!foster?.startDate || !foster?.expectedEndDate) return 0;
  const total = new Date(foster.expectedEndDate).getTime() - new Date(foster.startDate).getTime();
  const elapsed = Date.now() - new Date(foster.startDate).getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export default function FosterDashboard() {
  const router = useRouter();
  const [fosters, setFosters] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [missing, setMissing] = useState<number[]>([]);
  const [canFinalize, setCanFinalize] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Weekly report submission
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportWeek, setReportWeek] = useState(1);
  const [appetite, setAppetite] = useState("Good");
  const [energy, setEnergy] = useState("Active");
  const [behavior, setBehavior] = useState("");
  const [healthConcerns, setHealthConcerns] = useState("");
  const [overallProgress, setOverallProgress] = useState("Good");
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get("/foster/my");
      setFosters(res.data);
      const active = res.data.find((f: any) => f.status === "active");
      if (active) {
        const [rRes, mRes, cfRes] = await Promise.allSettled([
          api.get(`/foster/${active._id}/reports`),
          api.get(`/foster/${active._id}/reports/missing`),
          api.get(`/foster/${active._id}/can-finalize`),
        ]);
        if (rRes.status === "fulfilled") setReports(rRes.value.data);
        if (mRes.status === "fulfilled") setMissing(mRes.value.data.missing || []);
        if (cfRes.status === "fulfilled") setCanFinalize(cfRes.value.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleSubmitReport = async () => {
    if (!behavior.trim()) { Alert.alert("Required", "Please describe your pet's behavior this week."); return; }
    const activeFoster = fosters.find(f => f.status === "active");
    if (!activeFoster) return;
    setSubmittingReport(true);
    try {
      await api.post(`/foster/${activeFoster._id}/reports`, {
        weekNumber: reportWeek,
        appetite,
        energy,
        behavior,
        healthConcerns,
        overallProgress,
        vetVisitRequired: false,
      });
      Alert.alert("Submitted!", `Week ${reportWeek} report sent to staff.`);
      setShowReportModal(false);
      setBehavior(""); setHealthConcerns("");
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not submit report.");
    } finally { setSubmittingReport(false); }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <ActivityIndicator size="large" color="#1E6B45" />
    </SafeAreaView>
  );

  const activeFoster = fosters.find(f => f.status === "active");
  const progress = activeFoster ? trialProgress(activeFoster) : 0;
  const weeksRequired = activeFoster?.weeklyReportsRequired || 0;
  const weeksSubmitted = activeFoster?.weeklyReportsSubmitted || 0;
  const nextMissingWeek = missing[0] || (weeksSubmitted + 1);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      {/* Header */}
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
            {/* Trial Summary Card */}
            <View className="rounded-3xl bg-[#1E6B45] p-5 mb-4">
              <Text className="text-white font-bold text-lg">{activeFoster.pet?.name || "Your Pet"}</Text>
              <Text className="text-[#A7D3BB] text-sm mt-1">
                Trial period · {activeFoster.trialDurationDays || "?"} days
              </Text>

              {/* Progress bar */}
              <View className="mt-4 bg-[#155436] rounded-full h-3">
                <View
                  className="bg-[#4ADE80] rounded-full h-3"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-[#A7D3BB] text-xs">Day 1</Text>
                <Text className="text-white text-xs font-bold">{progress}% complete</Text>
                <Text className="text-[#A7D3BB] text-xs">Day {activeFoster.trialDurationDays || "?"}</Text>
              </View>

              {activeFoster.expectedEndDate && (
                <Text className="text-[#A7D3BB] text-sm mt-3">
                  {daysLeft(activeFoster.expectedEndDate)} days remaining
                </Text>
              )}
            </View>

            {/* Weekly Reports Card */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border border-[#DCE8E1]">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-bold text-[#111827] dark:text-white text-base">Weekly Reports</Text>
                <Text className="text-sm text-[#6B7280]">{weeksSubmitted}/{weeksRequired} submitted</Text>
              </View>

              {/* Report dots */}
              <View className="flex-row flex-wrap gap-2 mb-4">
                {Array.from({ length: weeksRequired }, (_, i) => i + 1).map(w => {
                  const submitted = reports.some(r => r.weekNumber === w);
                  return (
                    <View
                      key={w}
                      className={`w-9 h-9 rounded-full items-center justify-center ${submitted ? "bg-[#1E6B45]" : missing.includes(w) ? "bg-red-100" : "bg-[#F3F4F6]"}`}
                    >
                      <Text className={`text-xs font-bold ${submitted ? "text-white" : missing.includes(w) ? "text-red-500" : "text-[#6B7280]"}`}>W{w}</Text>
                    </View>
                  );
                })}
              </View>

              {missing.length > 0 && (
                <View className="bg-amber-50 rounded-xl p-3 mb-3 border border-amber-200 flex-row items-center">
                  <Ionicons name="alert-circle-outline" size={18} color="#D97706" />
                  <Text className="ml-2 text-amber-700 text-sm flex-1">
                    Week {missing[0]} report is due. Please submit it.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => { setReportWeek(nextMissingWeek); setShowReportModal(true); }}
                className="bg-[#1E6B45] rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold">Submit Week {nextMissingWeek} Report</Text>
              </TouchableOpacity>
            </View>

            {/* Adoption Eligibility Card */}
            {canFinalize && (
              <View className={`rounded-2xl p-5 mb-4 border ${canFinalize.allowed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100"}`}>
                <View className="flex-row items-center">
                  <Ionicons
                    name={canFinalize.allowed ? "checkmark-circle" : "close-circle"}
                    size={22}
                    color={canFinalize.allowed ? "#16A34A" : "#DC2626"}
                  />
                  <Text className={`ml-2 font-bold text-base ${canFinalize.allowed ? "text-green-700" : "text-red-700"}`}>
                    {canFinalize.allowed ? "Eligible for adoption" : "Not yet eligible"}
                  </Text>
                </View>
                {!canFinalize.allowed && canFinalize.reason && (
                  <Text className="text-red-600 text-sm mt-2">{canFinalize.reason}</Text>
                )}
                {canFinalize.allowed && (
                  <Text className="text-green-600 text-sm mt-2">
                    All requirements met! Contact staff to finalize your adoption.
                  </Text>
                )}
              </View>
            )}

            {/* Past Placements */}
            {fosters.filter(f => f.status !== "active").length > 0 && (
              <View className="mb-4">
                <Text className="font-bold text-[#111827] dark:text-white mb-3">Past Placements</Text>
                {fosters.filter(f => f.status !== "active").map(f => (
                  <View key={f._id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-2 border border-[#DCE8E1]">
                    <Text className="font-semibold text-[#111827] dark:text-white">{f.pet?.name || "Pet"}</Text>
                    <Text className="text-[#6B7280] text-sm capitalize">{f.status} · {f.outcome || "—"}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Weekly Report Modal */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
            <Text className="text-xl font-extrabold text-[#111827] dark:text-white mb-4">Week {reportWeek} Report</Text>

            <Text className="text-sm font-semibold text-[#374151] mb-1">Appetite</Text>
            <View className="flex-row gap-2 mb-3">
              {["Excellent","Good","Fair","Poor"].map(opt => (
                <TouchableOpacity key={opt} onPress={() => setAppetite(opt)}
                  className={`px-3 py-1.5 rounded-full border ${appetite === opt ? "bg-[#1E6B45] border-[#1E6B45]" : "border-[#DCE8E1]"}`}>
                  <Text className={appetite === opt ? "text-white text-xs" : "text-[#6B7280] text-xs"}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-semibold text-[#374151] mb-1">Energy Level</Text>
            <View className="flex-row gap-2 mb-3">
              {["Very Active","Active","Low","Lethargic"].map(opt => (
                <TouchableOpacity key={opt} onPress={() => setEnergy(opt)}
                  className={`px-3 py-1.5 rounded-full border ${energy === opt ? "bg-[#1E6B45] border-[#1E6B45]" : "border-[#DCE8E1]"}`}>
                  <Text className={energy === opt ? "text-white text-xs" : "text-[#6B7280] text-xs"}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-semibold text-[#374151] mb-1">Behavior Notes *</Text>
            <TextInput
              value={behavior} onChangeText={setBehavior} multiline numberOfLines={3}
              placeholder="How is your pet behaving at home this week?"
              className="border border-[#DCE8E1] rounded-xl p-3 text-sm text-[#111827] mb-3"
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />

            <Text className="text-sm font-semibold text-[#374151] mb-1">Health Concerns (optional)</Text>
            <TextInput
              value={healthConcerns} onChangeText={setHealthConcerns}
              placeholder="Any health issues or vet visits?"
              className="border border-[#DCE8E1] rounded-xl p-3 text-sm text-[#111827] mb-3"
            />

            <Text className="text-sm font-semibold text-[#374151] mb-1">Overall Progress</Text>
            <View className="flex-row gap-2 mb-5">
              {["Excellent","Good","Fair","Needs Attention"].map(opt => (
                <TouchableOpacity key={opt} onPress={() => setOverallProgress(opt)}
                  className={`px-3 py-1.5 rounded-full border ${overallProgress === opt ? "bg-[#1E6B45] border-[#1E6B45]" : "border-[#DCE8E1]"}`}>
                  <Text className={overallProgress === opt ? "text-white text-xs" : "text-[#6B7280] text-xs"}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setShowReportModal(false)}
                className="flex-1 border border-[#DCE8E1] rounded-xl py-3 items-center">
                <Text className="text-[#6B7280] font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmitReport} disabled={submittingReport}
                className="flex-1 bg-[#1E6B45] rounded-xl py-3 items-center">
                {submittingReport
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text className="text-white font-bold">Submit</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
