import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AppointmentCardProps {
  title: string;
  date: string;
  status: "Open" | "Full" | "Completed";
  isEnrolled?: boolean; // 👉 NEW: Tell the card if the user is already signed up
  onPress?: () => void;
}

export default function AppointmentCard({
  title,
  date,
  status,
  isEnrolled,
  onPress,
}: AppointmentCardProps) {
  const isUnavailable =
    (!isEnrolled && status === "Full") || status === "Completed";

  // 👉 Dynamic styling based on whether they are enrolled
  let buttonText = "Sign Up";
  let buttonColor = "bg-primary dark:bg-emerald-600";

  if (status === "Full") buttonText = "Waitlist";
  if (status === "Completed") buttonText = "Finished";

  // Override if enrolled
  if (isEnrolled) {
    buttonText = "Cancel Shift";
    buttonColor =
      "bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800";
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-darkBlue dark:text-white font-bold text-base">
          {title}
        </Text>
        <Text
          className={`font-bold ${status === "Open" ? "text-primary dark:text-emerald-400" : "text-neutral dark:text-gray-400"}`}
        >
          {isEnrolled ? "Enrolled" : status}
        </Text>
      </View>

      <Text className="text-neutral dark:text-gray-400 text-sm mb-5">
        {date}
      </Text>

      <TouchableOpacity
        className={`py-3 rounded-xl items-center ${isUnavailable ? "bg-gray-200 dark:bg-gray-700" : buttonColor}`}
        disabled={isUnavailable}
        onPress={onPress}
      >
        <Text
          className={`font-bold ${
            isUnavailable
              ? "text-gray-500 dark:text-gray-400"
              : isEnrolled
                ? "text-red-500 dark:text-red-400"
                : "text-white"
          }`}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
