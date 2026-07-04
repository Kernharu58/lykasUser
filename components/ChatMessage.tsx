import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { COLORS } from "../utils/colors";

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
    // NOTE: alignment/color can't be a NativeWind className built from `isUser` (see utils/colors.ts) —
    // set via inline style so it's guaranteed to apply on native.
    <View className="mb-4 w-full flex-row items-end" style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && (
        <View className="mb-5 mr-2 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.primary }}>
          <Ionicons name="paw" size={16} color="white" />
        </View>
      )}

      <View className="max-w-[75%]">
        <View
          className="rounded-2xl px-4 py-3 shadow-sm"
          style={
            isUser
              ? { borderBottomRightRadius: 4, backgroundColor: COLORS.primary }
              : { borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSoft }
          }
        >
          <Text className="text-base leading-6" style={{ color: isUser ? COLORS.white : COLORS.ink }}>
            {item.text}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center gap-1" style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}>
          <Text className="text-[10px]" style={{ color: COLORS.mutedLight }}>{messageTime}</Text>
          {isUser && item.failed ? <Ionicons name="alert-circle" size={12} color={COLORS.danger} /> : null}
          {isUser && item.pending ? <Ionicons name="time-outline" size={12} color={COLORS.mutedLight} /> : null}
          {isUser && !item.pending && !item.failed ? <Ionicons name="checkmark-done" size={12} color={COLORS.primary} /> : null}
        </View>
      </View>
    </View>
  );
}
