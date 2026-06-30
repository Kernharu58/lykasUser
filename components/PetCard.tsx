import { Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getStatusColor } from "@/components/StatusBadge";
import { COLORS } from "../utils/colors";

interface PetCardProps {
  id: string;
  name: string;
  breed: string;
  image: string;
  status?: string;
}

function StatusPill({ status }: { status: string }) {
  const bg = getStatusColor(status, "pet");
  return (
    <View
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: bg,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: "700" }}>
        {status}
      </Text>
    </View>
  );
}

export default function PetCard({ id, name, breed, image, status }: PetCardProps) {
  return (
    <View
      style={{ width: "48%" }}
      className="bg-white rounded-3xl p-3 mb-5 shadow-sm border border-gray-100 flex-col dark:bg-gray-800 dark:border-gray-700"
    >
      {/* Image + status badge */}
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: image }}
          className="w-full rounded-2xl mb-3 bg-gray-100"
          style={{ height: 150 }}
          resizeMode="cover"
        />
        {status ? <StatusPill status={status} /> : null}
      </View>

      {/* Name & breed */}
      <View className="flex-1 mb-3 px-1">
        <Text
          className="text-darkBlue font-extrabold text-lg dark:text-white"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text
          className="text-warnBrown font-semibold text-xs mt-0.5"
          numberOfLines={1}
        >
          {breed}
        </Text>
      </View>

      {/* CTA — greyed out when not available */}
      <Link href={`/pets/${id}`} asChild>
        <TouchableOpacity
          className="py-3 rounded-xl items-center w-full shadow-sm"
          style={{
            backgroundColor:
              status === "Adopted" ? COLORS.gray300 : getStatusColor("Available", "pet"),
          }}
          disabled={status === "Adopted"}
        >
          <Text className="text-white font-bold text-sm">
            {status === "Adopted" ? "Already Adopted" : `Meet ${name}`}
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
