import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  status: string;
}

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
      setIsFavorite((value) => !value);
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
        <Text className="text-xl font-bold text-[#2C2C2C] dark:text-white mt-4 mb-2">Unable to load pet</Text>
        <Text className="text-center text-[#7A7068] dark:text-gray-300 mb-6">{error || "Pet not found"}</Text>
        <TouchableOpacity className="bg-[#D4622A] py-3 px-6 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="relative w-full h-80">
        <Image source={{ uri: pet.imageUrl }} className="w-full h-full" resizeMode="cover" />
        <SafeAreaView className="absolute top-0 left-0 right-0 px-4 pt-2 flex-row justify-between">
          <TouchableOpacity className="w-10 h-10 bg-white/85 rounded-full items-center justify-center shadow-sm" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 bg-white/85 rounded-full items-center justify-center shadow-sm" onPress={handleToggleFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#D4622A" : "#2C2C2C"} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView className="flex-1 bg-white dark:bg-gray-900 -mt-8 rounded-t-3xl px-6 pt-8" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-3xl font-extrabold text-[#2C2C2C] dark:text-white">{pet.name}</Text>
          <View className="rounded-full bg-[#E8F5EE] px-3 py-1"><Text className="text-xs font-bold text-[#3D8A5E]">{pet.status}</Text></View>
        </View>
        <Text className="text-[#D4622A] font-bold text-lg mb-6">{pet.breed}</Text>

        <View className="flex-row justify-between bg-[#F4F2EE] dark:bg-gray-800 rounded-2xl p-4 mb-6">
          <View className="items-center flex-1"><Text className="text-[#7A7068] text-xs mb-1">Age</Text><Text className="text-[#2C2C2C] dark:text-white font-bold">{pet.age}</Text></View>
          <View className="items-center flex-1"><Text className="text-[#7A7068] text-xs mb-1">Gender</Text><Text className="text-[#2C2C2C] dark:text-white font-bold">{pet.gender}</Text></View>
          <View className="items-center flex-1"><Text className="text-[#7A7068] text-xs mb-1">Weight</Text><Text className="text-[#2C2C2C] dark:text-white font-bold">{pet.weight}</Text></View>
        </View>

        <View className="mb-6 rounded-3xl border border-[#E8E4DC] bg-[#FDFAF4] p-4 dark:bg-gray-800 dark:border-gray-700">
          <Text className="text-lg font-extrabold text-[#2C2C2C] dark:text-white mb-2">Health & vaccinations</Text>
          <View className="flex-row items-center"><Ionicons name="medkit" size={20} color="#3D8A5E" /><Text className="text-[#3D3830] dark:text-gray-300 ml-2 font-medium">{pet.healthStatus}</Text></View>
        </View>

        <Text className="text-lg font-extrabold text-[#2C2C2C] dark:text-white mb-2">About {pet.name}</Text>
        <Text className="text-[#7A7068] dark:text-gray-400 leading-6 text-base">{pet.description}</Text>
      </ScrollView>

      <View className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-[#E8E4DC] dark:border-gray-800 px-6 py-4 flex-row ${Platform.OS === "ios" ? "pb-8" : ""}`}>
        <TouchableOpacity className="bg-white dark:bg-gray-800 border-2 border-[#D4622A] rounded-xl justify-center items-center flex-1 mr-3" onPress={() => router.push(`/foster/${id}` as any)}>
          <Text className="text-[#D4622A] font-bold">Foster</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#D4622A] py-4 rounded-xl flex-1 items-center shadow-sm" onPress={() => router.push(`/pets/apply/${id}`)}>
          <Text className="text-white font-bold text-base">Adopt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

