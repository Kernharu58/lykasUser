import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../components/StateView";
import { getStatusColor } from "../components/StatusBadge";
import { formatDateWithWeekday, formatTime } from "../utils/format";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

const TAB_OPTIONS = ["All", "Interviews", "Home Visits", "Appointments"];

export default function MyAppointments() {
  const router = useRouter();
  const [tab, setTab]               = useState("All");
  const [interviews, setInterviews] = useState<any[]>([]);
  const [homeVisits, setHomeVisits] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setError(null);
      const [intRes, hvRes, apptRes] = await Promise.allSettled([
        api.get("/interviews/my"),
        api.get("/home-visits/my"),
        api.get("/appointments"),
      ]);
      if (intRes.status  === "fulfilled") setInterviews(intRes.value.data    || []);
      if (hvRes.status   === "fulfilled") setHomeVisits(hvRes.value.data     || []);
      if (apptRes.status === "fulfilled") setAppointments(apptRes.value.data || []);
      if (intRes.status === "rejected" && hvRes.status === "rejected" && apptRes.status === "rejected") {
        setError("Could not load your schedule.");
      }
    } catch (e) {
      console.error(e);
      setError("Could not load your schedule.");
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  // Unified list for "All" tab
  const allItems = [
    ...interviews.map(i  => ({ ...i, _kind: "interview" })),
    ...homeVisits.map(hv => ({ ...hv, _kind: "homevisit" })),
    ...appointments.map(a => ({ ...a, _kind: "appointment" })),
  ].sort((a, b) => {
    const da = new Date(a.scheduledDate || a.date || a.createdAt).getTime();
    const db = new Date(b.scheduledDate || b.date || b.createdAt).getTime();
    return da - db;
  });

  const visibleItems =
    tab === "All"          ? allItems :
    tab === "Interviews"   ? interviews.map(i  => ({ ...i,  _kind: "interview"   })) :
    tab === "Home Visits"  ? homeVisits.map(hv => ({ ...hv, _kind: "homevisit"   })) :
                             appointments.map(a  => ({ ...a,  _kind: "appointment" }));

  const upcomingCount = allItems.filter(
    i => !["completed","cancelled","no-show"].includes(i.status)
  ).length;

  if (loading) return (
    <SafeAreaView className="flex-1 bg-bgSoft px-6">
      <LoadingState message="Loading schedule..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-ink dark:text-white">My Schedule</Text>
          <Text className="text-xs font-bold text-muted">{upcomingCount} upcoming</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAll(); }}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-5">
          <View className="flex-row gap-2">
            {TAB_OPTIONS.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                className={`rounded-full px-4 py-2 ${tab === t ? "bg-primary" : "bg-white border border-border dark:bg-gray-800"}`}>
                <Text className={`text-xs font-extrabold ${tab === t ? "text-white" : "text-muted dark:text-gray-300"}`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="px-6 gap-4">
          {error ? (
            <ErrorState message={error} onAction={fetchAll} />
          ) : visibleItems.length === 0 ? (
            <EmptyState
              title="No appointments found"
              message="Your interviews, home visits, and appointments will appear here."
              icon="calendar-outline"
            />
          ) : (
            visibleItems.map((item, idx) => {
              const kind       = item._kind;
              const dateStr    = item.scheduledDate || item.date;
              const statusKey  = item.result && item.result !== "pending" ? item.result : item.status;
              const color      = getStatusColor(statusKey, "appointment");

              const icon =
                kind === "interview"   ? "mic-outline"      :
                kind === "homevisit"   ? "home-outline"     :
                                         "calendar-outline";

              const kindLabel =
                kind === "interview"   ? "Adoption Interview"  :
                kind === "homevisit"   ? "Home Visit"          :
                                         item.type || "Appointment";

              const subtitle =
                kind === "interview"   ? `${item.method || "TBD"} · ${item.location || "Location TBD"}` :
                kind === "homevisit"   ? (item.address || "Address TBD") :
                                         (item.description || "");

              return (
                <View
                  key={`${kind}-${item._id ?? idx}`}
                  className="rounded-3xl border border-border bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  {/* Kind + status */}
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-mintBg">
                        <Ionicons name={icon as any} size={18} color={COLORS.primary} />
                      </View>
                      <Text className="font-extrabold text-ink dark:text-white">{kindLabel}</Text>
                    </View>
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: color + "20" }}>
                      <Text className="text-xs font-bold capitalize" style={{ color }}>{statusKey}</Text>
                    </View>
                  </View>

                  {/* Date / time */}
                  {dateStr && (
                    <View className="flex-row items-center gap-2 mb-2">
                      <Ionicons name="time-outline" size={14} color={COLORS.muted} />
                      <Text className="text-sm text-muted">
                        {formatDateWithWeekday(dateStr)} · {formatTime(dateStr)}
                      </Text>
                    </View>
                  )}

                  {/* Subtitle */}
                  {subtitle ? (
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="location-outline" size={14} color={COLORS.muted} />
                      <Text className="text-sm text-muted flex-1" numberOfLines={1}>{subtitle}</Text>
                    </View>
                  ) : null}

                  {/* Pet name */}
                  {item.pet?.name && (
                    <View className="mt-2 flex-row items-center gap-2">
                      <Ionicons name="paw-outline" size={14} color={COLORS.muted} />
                      <Text className="text-sm text-muted">{item.pet.name}</Text>
                    </View>
                  )}

                  {/* Notes from result */}
                  {item.notes && (
                    <View className="mt-3 rounded-xl bg-cardBg p-3 dark:bg-gray-700">
                      <Text className="text-xs text-muted dark:text-gray-300">{item.notes}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
