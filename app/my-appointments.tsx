import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import AppointmentCard from "../components/AppointmentCard";
import api from "./utils/api";

export default function MyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyShifts = async () => {
    try {
      const response = await api.get("/appointments/my-appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShifts();
  }, []);

  // 👉 Handle Cancellation
  const handleCancel = async (id: string) => {
    Alert.alert("Cancel Shift", "Are you sure you want to drop this shift?", [
      { text: "No, keep it", style: "cancel" },
      {
        text: "Yes, drop it",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/appointments/${id}/cancel`);
            fetchMyShifts(); // Refresh the list!
          } catch (error) {
            Alert.alert("Error", "Could not cancel shift");
          }
        },
      },
    ]);
  };

  // Helper to format date
  const formatDate = (dateString: string, durationHours: number) => {
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const start = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const end = new Date(
      d.getTime() + durationHours * 3600000,
    ).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${datePart} • ${start} - ${end}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-darkBlue dark:text-white ml-auto mr-auto">
          My Shifts
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2D6A4F" />
        ) : appointments.length > 0 ? (
          appointments.map((shift: any) => (
            <AppointmentCard
              key={shift._id}
              title={shift.title}
              date={formatDate(shift.date, shift.durationHours)}
              status={shift.status}
              isEnrolled={true} // 👉 Tells the card to render the Cancel button
              onPress={() => handleCancel(shift._id)} // 👉 Triggers cancellation
            />
          ))
        ) : (
          <View className="items-center mt-20">
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text className="text-center text-neutral mt-4">
              You haven&apos;t signed up for any shifts yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
