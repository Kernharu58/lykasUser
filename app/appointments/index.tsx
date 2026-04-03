import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppointmentCard from "../../components/AppointmentCard";
import api from "../utils/api";

interface Appointment {
  _id: string;
  title: string;
  date: string;
  durationHours: number;
  capacity: number;
  status: "Open" | "Full" | "Completed";
}

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatAppointmentDate = (dateString: string, durationHours: number) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const startTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endDate = new Date(date.getTime() + durationHours * 60 * 60 * 1000);
    const endTime = endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${datePart} • ${startTime} - ${endTime}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center z-10"
        >
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center pointer-events-none">
          <Text className="text-xl font-bold text-darkBlue dark:text-white">
            Appointments
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Your Impact Card */}
        <View className="bg-primary dark:bg-emerald-900 rounded-2xl p-5 mb-8 shadow-sm">
          <Text className="text-white font-bold text-lg mb-1">Your Impact</Text>
          <Text className="text-white/80 text-sm mb-4">This Month</Text>
          <View className="flex-row items-baseline">
            <Text className="text-warnBrown font-bold text-4xl mr-2">12</Text>
            <Text className="text-white font-medium text-lg">Hours</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-darkBlue dark:text-white mb-4">
          Available Shifts
        </Text>

        {loading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator size="large" color="#2D6A4F" />
            <Text className="text-neutral mt-4">Loading shifts...</Text>
          </View>
        ) : appointments.length > 0 ? (
          appointments.map((shift) => (
            <AppointmentCard
              key={shift._id}
              title={shift.title}
              date={formatAppointmentDate(shift.date, shift.durationHours)}
              status={shift.status}
              // 👉 IMPORTANT CHANGE: Push to the new application form!
              onPress={() => router.push(`/appointments/apply/${shift._id}`)}
            />
          ))
        ) : (
          <Text className="text-neutral dark:text-gray-400 text-center mt-6">
            No upcoming shifts available right now. Check back soon!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
