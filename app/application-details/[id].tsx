import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";
import { formatDateLong, formatDateLongWithWeekday } from "../../utils/format";
import { COLORS } from "../../utils/colors";

// ─── Timeline data ────────────────────────────────────────────────────────────
const ADOPTION_STEPS = [
  "Application submitted",
  "Under review",
  "Interview scheduled",
  "Interview completed",
  "Home visit scheduled",
  "Home visit completed",
  "Approved",
];

const FOSTER_STEPS = [
  "Application submitted",
  "Under review",
  "Approved",
  "Foster period active",
];

function getAdoptionCompletedSteps(
  app: any,
  interview: any,
  homeVisit: any,
): boolean[] {
  return [
    true,
    app.status !== "pending" || !!interview,
    interview?.status === "scheduled" ||
      interview?.status === "completed" ||
      interview?.result === "passed",
    interview?.result === "passed",
    homeVisit?.status === "scheduled" ||
      homeVisit?.status === "completed" ||
      homeVisit?.result === "passed",
    homeVisit?.result === "passed",
    app.status === "approved",
  ];
}

function getFosterCompletedSteps(app: any): boolean[] {
  const approved = app.status === "approved";
  return [true, app.status !== "pending", approved, approved];
}

// ─── Interview scheduling section ─────────────────────────────────────────────
function InterviewSection({
  app,
  interview,
  accentColor,
}: {
  app: any;
  interview: any;
  accentColor: string;
}) {
  const router = useRouter();

  // Already scheduled — show details
  if (interview) {
    const resultColor =
      interview.result === "passed"
        ? COLORS.primary
        : interview.result === "failed"
        ? COLORS.danger
        : COLORS.warning;

    return (
      <View className="mt-5 rounded-3xl border border-border bg-white p-5 dark:bg-gray-800">
        <Text className="font-extrabold text-ink dark:text-white mb-1">
          Interview
        </Text>
        <Text className="text-sm text-muted dark:text-gray-400">
          {formatDateLongWithWeekday(interview.scheduledDate)}
          {interview.method ? ` · ${interview.method}` : ""}
          {interview.location ? ` · ${interview.location}` : " · TBD"}
        </Text>
        <Text className="mt-2 text-sm font-bold capitalize" style={{ color: resultColor }}>
          {interview.status}
        </Text>
      </View>
    );
  }

  // Ready to schedule
  return (
    <View
      className="mt-5 rounded-3xl border p-5"
      style={{ borderColor: accentColor + "40", backgroundColor: accentColor + "10" }}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name="calendar-outline" size={20} color={accentColor} />
        <Text className="font-extrabold text-ink dark:text-white">
          Schedule Interview
        </Text>
        <View className="rounded-full px-2 py-0.5 bg-warningBg">
          <Text className="text-xs font-bold text-brown">Action needed</Text>
        </View>
      </View>
      <Text className="text-sm text-muted dark:text-gray-400 leading-5 mb-4">
        Staff are ready to meet you. Pick a time slot for your adoption interview.
      </Text>
      <TouchableOpacity
        className="rounded-xl py-3 items-center"
        style={{ backgroundColor: accentColor }}
        onPress={() =>
          router.push(`/appointments/apply/${app._id}` as any)
        }
      >
        <Text className="font-extrabold text-white">Choose a Time Slot</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Home visit section ───────────────────────────────────────────────────────
function HomeVisitSection({ homeVisit }: { homeVisit: any }) {
  if (!homeVisit) return null;

  const resultColor =
    homeVisit.result === "passed"
      ? COLORS.primary
      : homeVisit.result === "failed"
      ? COLORS.danger
      : COLORS.warning;

  return (
    <View className="mt-3 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
      <Text className="font-extrabold text-ink dark:text-white mb-1">
        Home Visit
      </Text>
      <Text className="text-sm text-muted dark:text-gray-400">
        {formatDateLongWithWeekday(homeVisit.scheduledDate)}
        {homeVisit.address ? ` · ${homeVisit.address}` : ""}
      </Text>
      <Text className="mt-1 text-sm font-bold capitalize" style={{ color: resultColor }}>
        {homeVisit.status}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ApplicationDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [homeVisit, setHomeVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [appRes, interviewRes, homeVisitRes] = await Promise.allSettled([
        api.get(`/applications/${id}`),
        api.get("/interviews/my"),
        api.get("/home-visits/my"),
      ]);
      if (appRes.status === "fulfilled") setApp(appRes.value.data);
      if (interviewRes.status === "fulfilled") {
        const found = interviewRes.value.data.find(
          (i: any) => i.application === id || i.application?._id === id,
        );
        setInterview(found || null);
      }
      if (homeVisitRes.status === "fulfilled") {
        const found = homeVisitRes.value.data.find(
          (hv: any) => hv.application === id || hv.application?._id === id,
        );
        setHomeVisit(found || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading)
    return (
      <SafeAreaView className="flex-1 bg-bgSoft items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );

  if (!app)
    return (
      <SafeAreaView className="flex-1 bg-bgSoft items-center justify-center">
        <Text className="text-muted">Application not found.</Text>
      </SafeAreaView>
    );

  const isFoster = app.type === "foster";
  const accentColor = isFoster ? COLORS.accentOrange : COLORS.primary;
  const steps = isFoster ? FOSTER_STEPS : ADOPTION_STEPS;
  const completedSteps = isFoster
    ? getFosterCompletedSteps(app)
    : getAdoptionCompletedSteps(app, interview, homeVisit);
  const completedCount = completedSteps.filter(Boolean).length;

  // Show interview scheduling section only for adoption (not foster)
  const showAssessmentActions =
    !isFoster && app.status !== "rejected" && app.status !== "approved";

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800"
        >
          <Ionicons name="arrow-back" size={20} color={accentColor} />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-ink dark:text-white">
            Application Details
          </Text>
          <Text className="text-xs font-bold text-muted">
            {app._id?.slice(-10).toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        {/* Hero card */}
        <View className="rounded-3xl p-5" style={{ backgroundColor: accentColor }}>
          <Text className="text-sm font-bold text-white/80">Pet</Text>
          <Text className="mt-1 text-2xl font-extrabold text-white">
            {app.pet?.name}
          </Text>
          <Text className="text-white/80 mt-1 capitalize">
            {app.status} · {isFoster ? "Foster" : app.pet?.species}
          </Text>
          <View className="mt-4 h-3 rounded-full bg-white/20">
            <View
              className="h-3 rounded-full bg-white"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </View>
          <Text className="mt-2 text-xs font-bold text-white/80">
            {completedCount} of {steps.length} steps complete
          </Text>
        </View>

        {/* Timeline */}
        <Text className="mt-7 mb-3 text-xl font-extrabold text-ink dark:text-white">
          {isFoster ? "Foster Timeline" : "Adoption Timeline"}
        </Text>
        <View className="rounded-3xl border border-border bg-white p-5 dark:bg-gray-800">
          {steps.map((label, i) => (
            <View key={label} className="flex-row">
              <View className="items-center">
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: completedSteps[i] ? accentColor : COLORS.gray200,
                  }}
                >
                  <Ionicons
                    name={completedSteps[i] ? "checkmark" : "ellipse-outline"}
                    size={16}
                    color={completedSteps[i] ? "white" : COLORS.mutedLight}
                  />
                </View>
                {i !== steps.length - 1 && (
                  <View
                    className="h-8 w-0.5"
                    style={{
                      backgroundColor: completedSteps[i] ? accentColor : COLORS.gray200,
                    }}
                  />
                )}
              </View>
              <Text
                className="ml-3 mt-1 font-bold"
                style={{ color: completedSteps[i] ? COLORS.ink : COLORS.mutedLight }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Assessment actions (adoption only, while in progress) ── */}
        {showAssessmentActions && (
          <>
            <Text className="mt-7 mb-1 text-xl font-extrabold text-ink dark:text-white">
              Actions needed
            </Text>
            <Text className="text-sm text-muted dark:text-gray-400 mb-2">
              Complete these steps to move your application forward.
            </Text>

            {/* Interview scheduling */}
            <InterviewSection
              app={app}
              interview={interview}
              accentColor={accentColor}
            />
          </>
        )}

        {/* Home visit info */}
        {!isFoster && <HomeVisitSection homeVisit={homeVisit} />}

        {/* Foster period */}
        {isFoster && app.fosterPeriod && (
          <View className="mt-5 rounded-3xl border border-blushBorder bg-peachBg p-4">
            <Text className="font-extrabold text-accentOrange">Foster Period</Text>
            <Text className="mt-1 text-sm text-taupe">{app.fosterPeriod}</Text>
          </View>
        )}

        {/* Applied on */}
        <View className="mt-3 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
          <Text className="font-extrabold text-ink dark:text-white">
            Applied on
          </Text>
          <Text className="mt-1 text-sm text-muted">
            {formatDateLong(app.createdAt)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
