import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api"; 
import { useAuth } from "../../context/AuthContext"; // 👉 NEW: Import Auth Context

interface Appointment {
  _id: string;
  title: string;
  date: string;
  durationHours: number;
  status: string;
}

export default function Home() {
  const router = useRouter();
  
  // 👉 NEW: Grab the live user object directly from context!
  const { user } = useAuth();
  
  // Extract just the first name, or default to "Guest"
  const userName = user?.displayName ? user.displayName.split(" ")[0] : "Guest";

  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null); 
  const [loadingShift, setLoadingShift] = useState(true);

  useEffect(() => {
    // Fetch the user's enrolled shifts and find the next upcoming one
    const fetchNextShift = async () => {
      try {
        const response = await api.get("/appointments/my-appointments");
        const shifts = response.data;

        if (shifts && shifts.length > 0) {
          const now = new Date();
          // Filter out past shifts and sort by the closest date
          const upcoming = shifts
            .filter(
              (shift: Appointment) =>
                new Date(shift.date) > now && shift.status !== "Completed",
            )
            .sort(
              (a: Appointment, b: Appointment) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

          if (upcoming.length > 0) {
            setNextAppointment(upcoming[0]); // Set the absolute closest shift
          }
        }
      } catch (error) {
        console.error("Error fetching next shift:", error);
      } finally {
        setLoadingShift(false);
      }
    };

    fetchNextShift();
  }, []);

  // Helper to format the MongoDB date into a readable string
  const formatApptDate = (dateString: string, durationHours: number) => {
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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
      >
        {/* --- Header Area --- */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <Ionicons name="apps" size={20} color="#2D6A4F" />
            <Text className="text-xl font-bold text-darkBlue ml-2 dark:text-white">
              CarePaws
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-sharp" size={16} color="#D08C60" />
            <Text className="text-neutral text-sm ml-1 dark:text-gray-300">
              Angeles City, Pampanga
            </Text>
          </View>
        </View>

        {/* --- Dynamic Welcome Greeting --- */}
        <Text className="text-3xl font-bold text-darkBlue mt-8 dark:text-white">
          Welcome back, {userName}
        </Text>

        {/* --- Community Impact Section --- */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-darkBlue mb-4 dark:text-white">
            Community Impact
          </Text>
          <View className="bg-primary rounded-2xl p-5 dark:bg-emerald-900">
            <Text className="text-white font-bold text-lg mb-2">
              Help a Pet in Need
            </Text>
            <Text className="text-white/90 text-sm mb-6 leading-5">
              Shelters in your area are currently at{"\n"}capacity.{"\n"}Your
              support matters.
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity className="flex-1 bg-white dark:bg-emerald-800 py-3 rounded-xl items-center mr-2"
              onPress={() => router.push("/donate")}>
                <Text className="text-primary dark:text-white font-bold">
                  Donate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 border-2 border-white py-3 rounded-xl items-center ml-2"
                onPress={() => router.push("/appointments")}
              >
                <Text className="text-white font-bold">Volunteer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- Dynamic Current Appointment Section --- */}
        <View className="mt-8 mb-8">
          <Text className="text-lg font-bold text-darkBlue mb-4 dark:text-white">
            Current Appointment
          </Text>

          {loadingShift ? (
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 items-center justify-center">
              <ActivityIndicator color="#2D6A4F" />
            </View>
          ) : nextAppointment ? (
            <TouchableOpacity
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
              onPress={() => router.push("/my-appointments")}
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-darkBlue dark:text-white font-bold text-base">
                  {nextAppointment.title}
                </Text>
                <Text className="text-primary dark:text-emerald-400 font-bold">
                  Enrolled
                </Text>
              </View>
              <Text className="text-neutral dark:text-gray-400 text-sm mb-1">
                {formatApptDate(
                  nextAppointment.date,
                  nextAppointment.durationHours,
                )}
              </Text>
              <Text className="text-neutral dark:text-gray-400 text-sm flex-row items-center">
                Happy Paws Shelter
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-dashed border-gray-300 dark:border-gray-600 items-center">
              <Ionicons name="calendar-outline" size={32} color="#AAAAAA" />
              <Text className="text-neutral dark:text-gray-400 text-center mt-3 font-medium">
                You have no upcoming shifts.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/appointments")}
                className="mt-3"
              >
                <Text className="text-primary font-bold">Find a shift</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}