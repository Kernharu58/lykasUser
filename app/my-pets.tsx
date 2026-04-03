import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "./utils/api";

export default function MyPets() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPets = async () => {
      try {
        const response = await api.get("/pets/my-pets");
        setPets(response.data);
      } catch (error) {
        console.error("Error fetching my pets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPets();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center pointer-events-none">
          <Text className="text-xl font-bold text-darkBlue dark:text-white">
            My Pets
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2D6A4F" />
        ) : pets.length > 0 ? (
          pets.map((pet: any) => (
            <View
              key={pet._id}
              className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 flex-row items-center shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <Image
                source={{ uri: pet.imageUrl }}
                className="w-20 h-20 rounded-2xl"
              />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-darkBlue dark:text-white">
                  {pet.name}
                </Text>
                <Text className="text-neutral dark:text-gray-400">
                  {pet.breed}
                </Text>
                <View className="bg-green-50 dark:bg-emerald-900/30 self-start px-2 py-1 rounded-md mt-2">
                  <Text className="text-primary dark:text-emerald-400 text-xs font-bold uppercase">
                    {pet.status}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </View>
          ))
        ) : (
          <View className="items-center mt-20">
            <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
            <Text className="text-neutral dark:text-gray-400 text-center mt-4 text-base">
              You haven&apos;t adopted any pets yet.{"\n"}Visit the Adoption tab
              to find a friend!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
