import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import { formatDate } from "../../utils/format";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

const categoryColors: Record<string, string> = {
  "Adoption Drive": COLORS.primary,
  "Fundraiser": COLORS.warning,
  "Training": COLORS.blue,
  "Community": COLORS.purple,
  "Volunteer": COLORS.pink,
  "Other": COLORS.muted,
};

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<"upcoming" | "completed">("upcoming");
  const [registering, setRegistering] = useState<string | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setError(null);
      const [eventsRes, myRes] = await Promise.allSettled([
        api.get(`/events?status=${mode === "upcoming" ? "upcoming" : "completed"}`),
        api.get("/events/my-registrations"),
      ]);
      if (eventsRes.status === "fulfilled") setEvents(eventsRes.value.data.events || []);
      else setError("Could not load community events.");
      if (myRes.status === "fulfilled") {
        const ids = new Set<string>(myRes.value.data.map((r: any) => r.event?._id || r.event));
        setMyRegistrations(ids);
      }
    } catch (e) {
      console.error(e);
      setError("Could not load community events.");
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchEvents(); }, [mode]));

  const handleRSVP = async (eventId: string, isRegistered: boolean) => {
    setRegistering(eventId);
    try {
      if (isRegistered) {
        await api.delete(`/events/${eventId}/register`);
        setMyRegistrations(prev => { const s = new Set(prev); s.delete(eventId); return s; });
        setEvents(prev => prev.map(e => e._id === eventId ? { ...e, currentAttendees: (e.currentAttendees || 1) - 1 } : e));
      } else {
        await api.post(`/events/${eventId}/register`);
        setMyRegistrations(prev => new Set([...prev, eventId]));
        setEvents(prev => prev.map(e => e._id === eventId ? { ...e, currentAttendees: (e.currentAttendees || 0) + 1 } : e));
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not process registration.");
    } finally { setRegistering(null); }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-bgSoft px-6">
      <LoadingState message="Loading events..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} colors={[COLORS.primary]} />}
      >
        <View className="mt-4 mb-5">
          <Text className="text-3xl font-extrabold text-ink dark:text-white">Community Events</Text>
          <Text className="text-muted dark:text-gray-400 mt-2">RSVP, volunteer, and meet adoptable pets in person.</Text>
        </View>

        <View className="mb-5 flex-row rounded-2xl bg-cardBg p-1 dark:bg-gray-800">
          {(["upcoming", "completed"] as const).map((item) => (
            <TouchableOpacity key={item} className={`flex-1 rounded-xl py-3 ${mode === item ? "bg-white dark:bg-gray-700" : ""}`} onPress={() => setMode(item)}>
              <Text className={`text-center font-bold capitalize ${mode === item ? "text-primary" : "text-muted"}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <ErrorState message={error} onAction={fetchEvents} />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events found"
            message={mode === "upcoming" ? "Upcoming adoption drives and volunteer events will appear here." : "Completed events will appear here."}
            icon="calendar-outline"
          />
        ) : (
          <View className="gap-4">
            {events.map((event) => {
              const isRegistered = myRegistrations.has(event._id);
              const isFull = event.maxAttendees && event.currentAttendees >= event.maxAttendees;
              const color = categoryColors[event.category] || COLORS.muted;
              return (
                <View key={event._id} className="rounded-3xl border border-border bg-white p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="rounded-full px-3 py-1" style={{ backgroundColor: color + "20" }}>
                      <Text className="text-xs font-bold" style={{ color }}>{event.category}</Text>
                    </View>
                    <Text className="text-xs font-bold text-muted">{formatDate(event.date)}</Text>
                  </View>
                  <Text className="text-xl font-extrabold text-ink dark:text-white">{event.title}</Text>
                  {event.description ? <Text className="mt-1 text-sm text-muted" numberOfLines={2}>{event.description}</Text> : null}
                  <View className="mt-3 gap-1">
                    {event.location ? <Text className="text-sm text-muted"><Ionicons name="location-outline" size={13} /> {event.location}</Text> : null}
                    <Text className="text-sm text-muted">
                      <Ionicons name="people-outline" size={13} /> {event.currentAttendees || 0} going
                      {event.maxAttendees ? ` · ${event.maxAttendees - (event.currentAttendees || 0)} spots left` : ""}
                    </Text>
                  </View>
                  {mode === "upcoming" && (
                    <TouchableOpacity
                      className={`mt-5 rounded-xl py-3 ${isRegistered ? "border border-primary" : isFull ? "bg-gray-200" : "bg-primary"}`}
                      disabled={(!isRegistered && isFull) || registering === event._id}
                      onPress={() => handleRSVP(event._id, isRegistered)}
                    >
                      {registering === event._id
                        ? <ActivityIndicator color={isRegistered ? COLORS.primary : "#fff"} />
                        : <Text className={`text-center font-bold ${isRegistered ? "text-primary" : isFull ? "text-gray-500" : "text-white"}`}>
                            {isRegistered ? "Cancel RSVP" : isFull ? "Event Full" : "RSVP"}
                          </Text>}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
