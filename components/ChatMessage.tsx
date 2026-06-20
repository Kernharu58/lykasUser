import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface ChatMessageProps {
  item: {
    _id?: string;
    text: string;
    sender: string;
    time?: string;
    createdAt?: string;
    pending?: boolean;
    failed?: boolean;
  };
}

export default function ChatMessage({ item }: ChatMessageProps) {
  const isUser = String(item.sender || "").toLowerCase() === "user";

  const messageTime =
    item.time ||
    (item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "");

  return (
    <View className={`mb-4 w-full flex-row items-end ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <View className="mb-5 mr-2 h-8 w-8 items-center justify-center rounded-full bg-emerald-700">
          <Ionicons name="paw" size={16} color="white" />
        </View>
      )}

      <View className="max-w-[75%]">
        <View
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "rounded-br-sm bg-emerald-800"
              : "rounded-bl-sm border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
          }`}
        >
          <Text className={`text-base leading-6 ${isUser ? "text-white" : "text-gray-900 dark:text-white"}`}>{item.text}</Text>
        </View>

        <View className={`mt-1 flex-row items-center gap-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <Text className="text-[10px] text-gray-400">{messageTime}</Text>
          {isUser && item.failed ? <Ionicons name="alert-circle" size={12} color="#ef4444" /> : null}
          {isUser && item.pending ? <Ionicons name="time-outline" size={12} color="#9ca3af" /> : null}
          {isUser && !item.pending && !item.failed ? <Ionicons name="checkmark-done" size={12} color="#4ade80" /> : null}
        </View>
      </View>
    </View>
  );
}
