import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface ChatMessageProps {
  item: {
    text: string;
    sender: string;
    time?: string;
    createdAt?: string;
  };
}

export default function ChatMessage({ item }: ChatMessageProps) {
  const isUser = item.sender === "user";
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
      {/* Bot avatar */}
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-emerald-700 items-center justify-center mr-2 mb-5">
          <Text style={{ fontSize: 14 }}>🐾</Text>
        </View>
      )}

      <View className="max-w-[75%]">
        <View
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-emerald-800 rounded-br-sm"
              : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-sm"
          }`}
        >
          <Text className={`text-base leading-6 ${isUser ? "text-white" : "text-gray-900 dark:text-white"}`}>
            {item.text}
          </Text>
        </View>

        <View className={`flex-row items-center mt-1 gap-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <Text className="text-[10px] text-gray-400">{messageTime}</Text>
          {isUser && (
            <Ionicons name="checkmark-done" size={12} color="#4ade80" />
          )}
        </View>
      </View>
    </View>
  );
}
