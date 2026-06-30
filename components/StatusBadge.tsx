import React from "react";
import { Text, View } from "react-native";
import { STATUS_COLORS } from "@/utils/colors";

export type StatusTone = "success" | "warning" | "danger" | "neutral";

/**
 * Maps a domain's raw status strings to a visual tone.
 * Add new domains here instead of inventing a new color map in a screen.
 */
export const STATUS_DOMAIN_MAP: Record<string, Record<string, StatusTone>> = {
  appointment: {
    scheduled: "warning",
    rescheduled: "warning",
    confirmed: "success",
    completed: "neutral",
    cancelled: "danger",
    "no-show": "danger",
    passed: "success",
    failed: "danger",
  },
  payment: {
    paid: "success",
    pending: "warning",
    failed: "danger",
    refunded: "neutral",
  },
  volunteer: {
    approved: "success",
    pending: "warning",
    rejected: "danger",
    inactive: "neutral",
  },
  application: {
    approved: "success",
    pending: "warning",
    rejected: "danger",
    withdrawn: "neutral",
  },
  pet: {
    Available: "success",
    Fostered: "warning",
    Adopted: "neutral",
  },
};

interface StatusBadgeProps {
  /** Raw status string from the API, e.g. "pending", "confirmed". */
  status: string;
  /** Which status vocabulary to look up the status in. */
  domain: keyof typeof STATUS_DOMAIN_MAP;
  /** Fallback tone if the status string isn't in the domain map. */
  fallbackTone?: StatusTone;
  className?: string;
}

export function StatusBadge({
  status,
  domain,
  fallbackTone = "neutral",
  className = "",
}: StatusBadgeProps) {
  const tone = STATUS_DOMAIN_MAP[domain]?.[status] ?? fallbackTone;
  const bg = STATUS_COLORS[`${tone}Bg`];
  const text = STATUS_COLORS[tone];

  return (
    <View
      className={`rounded-full px-3 py-1 ${className}`}
      style={{ backgroundColor: bg }}
    >
      <Text className="text-xs font-bold capitalize" style={{ color: text }}>
        {status}
      </Text>
    </View>
  );
}

/** For places that need the raw hex (icons, charts) instead of the <View> badge. */
export function getStatusColor(
  status: string,
  domain: keyof typeof STATUS_DOMAIN_MAP,
  fallbackTone: StatusTone = "neutral",
): string {
  const tone = STATUS_DOMAIN_MAP[domain]?.[status] ?? fallbackTone;
  return STATUS_COLORS[tone];
}
