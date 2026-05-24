import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

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
    <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="arrow-back" size={20} color="#D4622A" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#2C2C2C] dark:text-white">My Pets</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 90 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#D4622A" />
        ) : pets.length > 0 ? (
          pets.map((pet) => (
            <TouchableOpacity key={pet._id} onPress={() => router.push(`/baby-book/${pet._id}` as any)} className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 flex-row items-center shadow-sm border border-[#E8E4DC] dark:border-gray-700">
              <Image source={{ uri: pet.imageUrl }} className="w-20 h-20 rounded-2xl bg-[#F5EDD6]" />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-extrabold text-[#2C2C2C] dark:text-white">{pet.name}</Text>
                <Text className="text-[#7A7068] dark:text-gray-400">{pet.breed}</Text>
                <View className="bg-[#E8F5EE] self-start px-2 py-1 rounded-md mt-2"><Text className="text-[#3D8A5E] text-xs font-bold uppercase">{pet.status}</Text></View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B0A898" />
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center mt-20 rounded-3xl bg-white p-8 border border-[#E8E4DC] dark:bg-gray-800 dark:border-gray-700">
            <Ionicons name="basket-outline" size={64} color="#D4622A" />
            <Text className="mt-4 text-xl font-extrabold text-[#2C2C2C] dark:text-white">No adopted pets yet</Text>
            <Text className="text-[#7A7068] dark:text-gray-400 text-center mt-2">Browse pets and start an application when you find a match.</Text>
            <TouchableOpacity className="mt-5 rounded-xl bg-[#D4622A] px-5 py-3" onPress={() => router.push("/(tabs)")}><Text className="font-bold text-white">Browse Pets</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

