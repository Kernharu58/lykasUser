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
import api from "../../utils/api";

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
  const [volunteerHours, setVolunteerHours] = useState(0); // 👉 1. New State for hours
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 👉 2. Fetch both the shifts AND the user profile simultaneously using Promise.all
      const [apptResponse, userResponse] = await Promise.all([
        api.get("/appointments"),
        api.get("/auth/me")
      ]);
      
      setAppointments(apptResponse.data);
      // Fallback to 0 if the user doesn't have any recorded hours yet
      setVolunteerHours(userResponse.data.volunteerHours || 0); 
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
          <Text className="text-white/80 text-sm mb-4">Total Volunteered</Text>
          <View className="flex-row items-baseline">
            {/* 👉 3. Render the dynamic variable here! */}
            <Text className="text-warnBrown font-bold text-4xl mr-2">
              {volunteerHours}
            </Text>
            <Text className="text-white font-medium text-lg">
              {volunteerHours === 1 ? "Hour" : "Hours"}
            </Text>
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
          appointments.map((shift, index) => (
            <AppointmentCard
              key={shift._id || index.toString()} 
              title={shift.title}
              date={formatAppointmentDate(shift.date, shift.durationHours)}
              status={shift.status}
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