import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";

interface Pet {
  _id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  weight: string;
  healthStatus: string;
  description: string;
  imageUrl: string;
  status: string; // "Available" | "Fostered" | "Adopted"
}

// Maps each pet status to what CTAs are permitted
function getCTAState(status: string) {
  switch (status) {
    case "Available":
      return { canAdopt: true, canFoster: true };
    case "Fostered":
      return { canAdopt: false, canFoster: true };
    case "Adopted":
    default:
      return { canAdopt: false, canFoster: false };
  }
}

// Status pill shown next to the pet name
const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  Available: { bg: "#EAF4EE", text: "#1E6B45", label: "Available" },
  Fostered:  { bg: "#FEF3E2", text: "#92400E", label: "Currently Fostered" },
  Adopted:   { bg: "#F3F4F6", text: "#6B7280", label: "Already Adopted" },
};

export default function PetProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        setError(null);
        if (!id || typeof id !== "string") {
          setError("Invalid pet ID");
          return;
        }
        const response = await api.get(`/pets/${id}`);
        setPet(response.data);
      } catch (fetchError: any) {
        if (fetchError.response?.status === 404) setError("Pet not found");
        else if (fetchError.response?.status === 400) setError("Invalid pet ID");
        else setError("Failed to load pet details");
      } finally {
        setLoading(false);
      }
    };
    fetchPetDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      const response = await api.post(`/auth/favorites/${id}`);
      setIsFavorite((v) => !v);
      Alert.alert("Saved", response.data.message || "Favorites updated.");
    } catch {
      Alert.alert("Error", "Could not update favorites.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#FDFAF4] dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#D4622A" />
        <Text className="text-[#7A7068] mt-4">Fetching details...</Text>
      </View>
    );
  }

  if (error || !pet) {
    return (
      <View className="flex-1 bg-[#FDFAF4] dark:bg-gray-900 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={48} color="#C0392B" />
        <Text className="text-xl font-bold text-[#2C2C2C] dark:text-white mt-4 mb-2">
          Unable to load pet
        </Text>
        <Text className="text-center text-[#7A7068] dark:text-gray-300 mb-6">
          {error || "Pet not found"}
        </Text>
        <TouchableOpacity
          className="bg-[#D4622A] py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { canAdopt, canFoster } = getCTAState(pet.status);
  const statusConfig =
    STATUS_CONFIG[pet.status] ?? STATUS_CONFIG["Adopted"];

  // Banner shown when the pet is not available for adoption
  const UnavailableBanner = () => {
    if (pet.status === "Available") return null;
    return (
      <View
        className="mx-6 mb-4 rounded-2xl px-4 py-3 flex-row items-center gap-2"
        style={{ backgroundColor: statusConfig.bg }}
      >
        <Ionicons
          name={pet.status === "Fostered" ? "home-outline" : "checkmark-circle-outline"}
          size={18}
          color={statusConfig.text}
        />
        <Text style={{ color: statusConfig.text }} className="font-bold text-sm flex-1">
          {pet.status === "Fostered"
            ? `${pet.name} is currently in a foster home but may still be available for adoption.`
            : `${pet.name} has already been adopted and is in their forever home.`}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Hero image */}
      <View className="relative w-full h-80">
        <Image source={{ uri: pet.imageUrl }} className="w-full h-full" resizeMode="cover" />
        <SafeAreaView className="absolute top-0 left-0 right-0 px-4 pt-2 flex-row justify-between">
          <TouchableOpacity
            className="w-10 h-10 bg-white/85 rounded-full items-center justify-center shadow-sm"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-white/85 rounded-full items-center justify-center shadow-sm"
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#D4622A" : "#2C2C2C"}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView
        className="flex-1 bg-white dark:bg-gray-900 -mt-8 rounded-t-3xl px-6 pt-8"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Name + status pill */}
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-3xl font-extrabold text-[#2C2C2C] dark:text-white">
            {pet.name}
          </Text>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: statusConfig.bg }}
          >
            <Text className="text-xs font-bold" style={{ color: statusConfig.text }}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <Text className="text-[#D4622A] font-bold text-lg mb-5">{pet.breed}</Text>

        {/* Stats row */}
        <View className="flex-row justify-between bg-[#F4F2EE] dark:bg-gray-800 rounded-2xl p-4 mb-6">
          <View className="items-center flex-1">
            <Text className="text-[#7A7068] text-xs mb-1">Age</Text>
            <Text className="text-[#2C2C2C] dark:text-white font-bold">{pet.age}</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-[#7A7068] text-xs mb-1">Gender</Text>
            <Text className="text-[#2C2C2C] dark:text-white font-bold">{pet.gender}</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-[#7A7068] text-xs mb-1">Weight</Text>
            <Text className="text-[#2C2C2C] dark:text-white font-bold">{pet.weight}</Text>
          </View>
        </View>

        {/* Health */}
        <View className="mb-6 rounded-3xl border border-[#E8E4DC] bg-[#FDFAF4] p-4 dark:bg-gray-800 dark:border-gray-700">
          <Text className="text-lg font-extrabold text-[#2C2C2C] dark:text-white mb-2">
            Health & vaccinations
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="medkit" size={20} color="#3D8A5E" />
            <Text className="text-[#3D3830] dark:text-gray-300 ml-2 font-medium">
              {pet.healthStatus}
            </Text>
          </View>
        </View>

        {/* About */}
        <Text className="text-lg font-extrabold text-[#2C2C2C] dark:text-white mb-2">
          About {pet.name}
        </Text>
        <Text className="text-[#7A7068] dark:text-gray-400 leading-6 text-base">
          {pet.description}
        </Text>
      </ScrollView>

      {/* Unavailability banner + CTA footer */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-[#E8E4DC] dark:border-gray-800"
        style={{ paddingBottom: Platform.OS === "ios" ? 32 : 16 }}
      >
        <UnavailableBanner />

        {/* Only render buttons when at least one action is allowed */}
        {(canAdopt || canFoster) && (
          <View className="flex-row gap-3 px-6 pt-4">
            {canFoster && (
              <TouchableOpacity
                className="bg-white dark:bg-gray-800 border-2 border-[#D4622A] rounded-xl justify-center items-center flex-1 py-4"
                onPress={() => router.push(`/pets/apply/${id}?type=foster` as any)}
              >
                <Text className="text-[#D4622A] font-bold">Foster</Text>
              </TouchableOpacity>
            )}
            {canAdopt && (
              <TouchableOpacity
                className="bg-[#1E6B45] py-4 rounded-xl flex-1 items-center shadow-sm"
                onPress={() => router.push(`/pets/apply/${id}` as any)}
              >
                <Text className="text-white font-bold text-base">Adopt</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Fully adopted — no actions available */}
        {!canAdopt && !canFoster && (
          <View className="px-6 pt-4">
            <View className="rounded-xl bg-[#F3F4F6] dark:bg-gray-800 py-4 items-center">
              <Text className="font-bold text-[#6B7280]">
                This pet is no longer available
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
