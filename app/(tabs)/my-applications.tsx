import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

// ─── Status colours ───────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  pending:  COLORS.warning,
  approved: COLORS.primary,
  rejected: COLORS.danger,
};
const STATUS_BG: Record<string, string> = {
  pending:  COLORS.warningBg,
  approved: COLORS.mintBg,
  rejected: COLORS.dangerBg,
};

// ─── Pipeline step definitions ────────────────────────────────────────────────
// Mirrors the same logic used in application-details so both screens are in sync.

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

// Returns { progress: 0–100, currentStepLabel: string }
function getPipelineProgress(app: any): { progress: number; currentStepLabel: string } {
  const isFoster = app.type === "foster";
  const steps = isFoster ? FOSTER_STEPS : ADOPTION_STEPS;

  if (app.status === "rejected") {
    return { progress: 100, currentStepLabel: "Application not approved" };
  }

  // For the list card we don't have interview/homeVisit data yet,
  // so derive the best estimate from status fields alone.
  const completedSteps = isFoster
    ? getFosterCompletedSteps(app)
    : getAdoptionCompletedSteps(app, app.interview ?? null, app.homeVisit ?? null);

  const completedCount = completedSteps.filter(Boolean).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  // Find the last completed step label to show as current stage
  let lastCompletedIndex = -1;
  completedSteps.forEach((done, i) => { if (done) lastCompletedIndex = i; });
  const currentStepLabel =
    lastCompletedIndex >= 0 ? steps[lastCompletedIndex] : steps[0];

  return { progress, currentStepLabel };
}

// ─── Progress bar component ───────────────────────────────────────────────────
function PipelineBar({
  progress,
  currentStepLabel,
  status,
}: {
  progress: number;
  currentStepLabel: string;
  status: string;
}) {
  const barColor =
    status === "rejected"
      ? COLORS.danger
      : status === "approved"
      ? COLORS.primary
      : COLORS.primary;

  return (
    <View className="mt-5">
      <View className="mb-2 flex-row justify-between items-center">
        <Text
          className="text-sm font-bold flex-1 mr-2 dark:text-white"
          style={{ color: COLORS.ink }}
          numberOfLines={1}
        >
          {currentStepLabel}
        </Text>
        <Text className="text-sm font-bold" style={{ color: barColor }}>
          {progress}%
        </Text>
      </View>
      <View className="h-2.5 rounded-full bg-cardBg dark:bg-gray-700">
        <View
          className="h-2.5 rounded-full"
          style={{ width: `${progress}%`, backgroundColor: barColor }}
        />
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setError(null);
      const res = await api.get("/applications/my");
      setApplications(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load applications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchApplications(); }, []));

  const handleCancel = async (id: string) => {
    Alert.alert(
      "Cancel Application",
      "Are you sure you want to withdraw this application?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/applications/${id}`);
              setApplications((prev) => prev.filter((a) => a._id !== id));
              Alert.alert("Cancelled", "Your application has been withdrawn.");
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.response?.data?.message || "Could not cancel.",
              );
            }
          },
        },
      ],
    );
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 bg-bgSoft px-6">
        <LoadingState message="Loading applications..." />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchApplications();
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        <View className="mt-4 mb-6">
          <Text className="text-3xl font-extrabold text-ink dark:text-white">
            My Applications
          </Text>
          <Text className="text-muted dark:text-gray-400 mt-2">
            Transparent status tracking from submission to decision.
          </Text>
        </View>

        {error ? (
          <ErrorState message={error} onAction={fetchApplications} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            message="Browse pets and apply for adoption to get started."
            icon="clipboard-outline"
            actionLabel="Browse Pets"
            onAction={() => router.push("/(tabs)/adopt" as any)}
          />
        ) : (
          <View className="gap-4">
            {applications.map((app) => {
              const status = app.status || "pending";
              const isFoster = app.type === "foster";
              const { progress, currentStepLabel } = getPipelineProgress(app);
              const accentColor =
                status === "rejected"
                  ? COLORS.danger
                  : isFoster
                  ? COLORS.accentOrange
                  : COLORS.primary;

              return (
                <TouchableOpacity
                  key={app._id}
                  className="rounded-3xl border border-border bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700"
                  onPress={() =>
                    router.push(`/application-details/${app._id}` as any)
                  }
                  activeOpacity={0.75}
                >
                  {/* Header row */}
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-xs font-bold uppercase tracking-widest text-sand">
                        {app._id?.slice(-8).toUpperCase()}
                        {isFoster ? " · Foster" : " · Adoption"}
                      </Text>
                      <Text className="mt-2 text-xl font-extrabold text-ink dark:text-white">
                        {app.pet?.name || "Pet"}
                      </Text>
                      <Text className="text-sm text-muted dark:text-gray-400">
                        {app.pet?.species}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: STATUS_BG[status] ?? COLORS.cardBg }}
                    >
                      <Text
                        className="text-xs font-bold capitalize"
                        style={{ color: STATUS_COLOR[status] ?? COLORS.muted }}
                      >
                        {status}
                      </Text>
                    </View>
                  </View>

                  {/* Pipeline progress bar */}
                  <PipelineBar
                    progress={progress}
                    currentStepLabel={currentStepLabel}
                    status={status}
                  />

                  {/* Tap hint */}
                  <Text className="mt-3 text-xs text-sand text-right">
                    Tap to see full timeline →
                  </Text>

                  {/* Withdraw — pending only */}
                  {status === "pending" && (
                    <TouchableOpacity
                      className="mt-3 rounded-xl border border-red-200 bg-red-50 py-3"
                      onPress={() => handleCancel(app._id)}
                    >
                      <Text className="text-center font-bold text-red-500">
                        Withdraw Application
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quick actions */}
        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            className="flex-1 rounded-2xl bg-primary py-4"
            onPress={() => router.push("/foster-dashboard" as any)}
          >
            <Text className="text-center font-extrabold text-white">
              Foster Trial
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-2xl border border-primary py-4"
            onPress={() => router.push("/documents" as any)}
          >
            <Text className="text-center font-extrabold text-primary">
              Documents
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
