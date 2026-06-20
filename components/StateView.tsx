import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type StateViewProps = {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "default" | "danger" | "warm";
};

const toneColor = {
  default: "#1E6B45",
  danger: "#EF4444",
  warm: "#D4622A",
};

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <View className="mt-20 items-center justify-center rounded-3xl border border-[#DCE8E1] bg-white p-8 dark:bg-gray-800 dark:border-gray-700">
      <ActivityIndicator size="large" color="#1E6B45" />
      <Text className="mt-4 text-center font-bold text-[#6B7280] dark:text-gray-300">{message}</Text>
    </View>
  );
}

export function EmptyState({ title, message, icon = "file-tray-outline", actionLabel, onAction, tone = "default" }: StateViewProps) {
  const color = toneColor[tone];

  return (
    <View className="mt-14 items-center justify-center rounded-3xl border border-dashed border-[#DCE8E1] bg-white p-8 dark:bg-gray-800 dark:border-gray-700">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EAF4EE]">
        <Ionicons name={icon} size={34} color={color} />
      </View>
      <Text className="mt-4 text-center text-lg font-extrabold text-[#111827] dark:text-white">{title}</Text>
      {message ? <Text className="mt-2 text-center text-sm leading-5 text-[#6B7280] dark:text-gray-400">{message}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity className="mt-6 rounded-2xl px-6 py-3" style={{ backgroundColor: color }} onPress={onAction}>
          <Text className="font-extrabold text-white">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ErrorState({ title = "Something went wrong", message = "Please check your connection and try again.", icon = "cloud-offline-outline", actionLabel = "Try Again", onAction, tone = "danger" }: Partial<StateViewProps>) {
  const color = toneColor[tone];

  return (
    <View className="mt-14 items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-8 dark:bg-red-900/20 dark:border-red-900/30">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-white">
        <Ionicons name={icon} size={34} color={color} />
      </View>
      <Text className="mt-4 text-center text-lg font-extrabold text-[#111827] dark:text-white">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-[#6B7280] dark:text-gray-300">{message}</Text>
      {onAction ? (
        <TouchableOpacity className="mt-6 rounded-2xl px-6 py-3" style={{ backgroundColor: color }} onPress={onAction}>
          <Text className="font-extrabold text-white">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
