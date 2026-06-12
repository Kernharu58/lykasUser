import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";

const STEPS = [
  "Application Submitted",
  "Under Review",
  "Interview Scheduled",
  "Interview Completed",
  "Home Visit Scheduled",
  "Home Visit Completed",
  "Approved",
];

function getCompletedSteps(app: any, interview: any, homeVisit: any) {
  const done: boolean[] = [true]; // always submitted
  done.push(app.status !== "pending" || !!interview); // under review
  done.push(interview?.status === "scheduled" || interview?.status === "completed" || interview?.result === "passed");
  done.push(interview?.result === "passed");
  done.push(homeVisit?.status === "scheduled" || homeVisit?.status === "completed" || homeVisit?.result === "passed");
  done.push(homeVisit?.result === "passed");
  done.push(app.status === "approved");
  return done;
}

export default function ApplicationDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [homeVisit, setHomeVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, interviewRes, homeVisitRes] = await Promise.allSettled([
          api.get(`/applications/${id}`),
          api.get("/interviews/my"),
          api.get("/home-visits/my"),
        ]);
        if (appRes.status === "fulfilled") setApp(appRes.value.data);
        if (interviewRes.status === "fulfilled") {
          const found = interviewRes.value.data.find((i: any) => i.application === id || i.application?._id === id);
          setInterview(found || null);
        }
        if (homeVisitRes.status === "fulfilled") {
          const found = homeVisitRes.value.data.find((hv: any) => hv.application === id || hv.application?._id === id);
          setHomeVisit(found || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <ActivityIndicator size="large" color="#1E6B45" />
    </SafeAreaView>
  );

  if (!app) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <Text className="text-[#6B7280]">Application not found.</Text>
    </SafeAreaView>
  );

  const completedSteps = getCompletedSteps(app, interview, homeVisit);
  const completedCount = completedSteps.filter(Boolean).length;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-[#111827] dark:text-white">Application Details</Text>
          <Text className="text-xs font-bold text-[#6B7280]">{app._id?.slice(-10).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        <View className="rounded-3xl bg-[#1E6B45] p-5">
          <Text className="text-sm font-bold text-white/80">Pet</Text>
          <Text className="mt-1 text-2xl font-extrabold text-white">{app.pet?.name}</Text>
          <Text className="text-white/80 mt-1 capitalize">{app.status} · {app.pet?.species}</Text>
          <View className="mt-4 h-3 rounded-full bg-white/20">
            <View className="h-3 rounded-full bg-white" style={{ width: `${(completedCount / STEPS.length) * 100}%` }} />
          </View>
          <Text className="mt-2 text-xs font-bold text-white/80">{completedCount} of {STEPS.length} steps complete</Text>
        </View>

        <Text className="mt-7 mb-3 text-xl font-extrabold text-[#111827] dark:text-white">Adoption Timeline</Text>
        <View className="rounded-3xl border border-[#DCE8E1] bg-white p-5 dark:bg-gray-800">
          {STEPS.map((label, i) => (
            <View key={label} className="flex-row">
              <View className="items-center">
                <View className={`h-8 w-8 items-center justify-center rounded-full ${completedSteps[i] ? "bg-[#1E6B45]" : "bg-[#E5E7EB]"}`}>
                  <Ionicons name={completedSteps[i] ? "checkmark" : "ellipse-outline"} size={16} color={completedSteps[i] ? "white" : "#9CA3AF"} />
                </View>
                {i !== STEPS.length - 1 && <View className={`h-8 w-0.5 ${completedSteps[i] ? "bg-[#1E6B45]" : "bg-[#E5E7EB]"}`} />}
              </View>
              <Text className={`ml-3 mt-1 font-bold ${completedSteps[i] ? "text-[#111827] dark:text-white" : "text-[#9CA3AF]"}`}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Interview info */}
        {interview && (
          <View className="mt-5 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
            <Text className="font-extrabold text-[#111827] dark:text-white">Interview</Text>
            <Text className="mt-1 text-sm text-[#6B7280]">
              {new Date(interview.scheduledDate).toLocaleDateString()} · {interview.method} · {interview.location || "TBD"}
            </Text>
            <Text className="mt-1 text-sm font-bold capitalize" style={{ color: interview.result === "passed" ? "#1E6B45" : interview.result === "failed" ? "#EF4444" : "#E8A020" }}>
              {interview.status}
            </Text>
          </View>
        )}

        {/* Home visit info */}
        {homeVisit && (
          <View className="mt-3 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
            <Text className="font-extrabold text-[#111827] dark:text-white">Home Visit</Text>
            <Text className="mt-1 text-sm text-[#6B7280]">
              {new Date(homeVisit.scheduledDate).toLocaleDateString()} · {homeVisit.address}
            </Text>
            <Text className="mt-1 text-sm font-bold capitalize" style={{ color: homeVisit.result === "passed" ? "#1E6B45" : homeVisit.result === "failed" ? "#EF4444" : "#E8A020" }}>
              {homeVisit.status}
            </Text>
          </View>
        )}

        <View className="mt-3 rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
          <Text className="font-extrabold text-[#111827] dark:text-white">Applied on</Text>
          <Text className="mt-1 text-sm text-[#6B7280]">{new Date(app.createdAt).toLocaleDateString()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}