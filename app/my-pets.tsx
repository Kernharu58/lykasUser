import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

interface AdoptedPet {
  _id: string;
  name: string;
  breed: string;
  imageUrl: string;
  status: string;
}

export default function MyPets() {
  const router = useRouter();
  const [pets, setPets] = useState<AdoptedPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPets = async () => {
      try {
        const response = await api.get("/pets/my-pets");
        setPets(response.data || []);
      } catch {
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPets();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-tan dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color={COLORS.accentOrange} />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-inkSoft dark:text-white">My Pets</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 90 }}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accentOrange} />
        ) : pets.length > 0 ? (
          pets.map((pet) => (
            <TouchableOpacity key={pet._id} onPress={() => router.push(`/baby-book/${pet._id}` as any)} className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 flex-row items-center shadow-sm border border-tan dark:border-gray-700">
              <Image source={{ uri: pet.imageUrl }} className="w-20 h-20 rounded-2xl bg-sandBg" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-extrabold text-inkSoft dark:text-white">{pet.name}</Text>
                <Text className="text-taupe dark:text-gray-400">{pet.breed}</Text>
                <View className="bg-mintPale self-start px-2 py-1 rounded-md mt-2"><Text className="text-mintDeep text-xs font-bold uppercase">{pet.status}</Text></View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.sand} />
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center mt-20 rounded-3xl bg-white p-8 border border-tan dark:bg-gray-800 dark:border-gray-700">
            <Ionicons name="basket-outline" size={64} color={COLORS.accentOrange} />
            <Text className="mt-4 text-xl font-extrabold text-inkSoft dark:text-white">No adopted pets yet</Text>
            <Text className="text-taupe dark:text-gray-400 text-center mt-2">Browse pets and start an application when you find a match.</Text>
            <TouchableOpacity className="mt-5 rounded-xl bg-accentOrange px-5 py-3" onPress={() => router.push("/(tabs)")}><Text className="font-bold text-white">Browse Pets</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

