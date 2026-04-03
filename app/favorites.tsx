import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PetCard from "../components/PetCard";
import api from "./utils/api";

interface Pet {
  _id: string;
  name: string;
  breed: string;
  imageUrl: string;
}

export default function Favorites() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get("/auth/favorites");
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 mt-4 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center z-10"
        >
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center pointer-events-none">
          <Text className="text-xl font-bold text-darkBlue dark:text-white">
            Favorites
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {loading ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color="#2D6A4F" />
            <Text className="text-neutral mt-4">Loading your favorites...</Text>
          </View>
        ) : favorites.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {favorites.map((pet) => (
              <PetCard
                key={pet._id}
                id={pet._id}
                name={pet.name}
                breed={pet.breed}
                image={pet.imageUrl}
              />
            ))}
          </View>
        ) : (
          <View className="items-center mt-20">
            <Ionicons name="heart-dislike-outline" size={64} color="#D1D5DB" />
            <Text className="text-neutral dark:text-gray-400 text-center mt-4 text-base px-10">
              You haven&apos;St liked any pets yet. Tap the heart on a
              pet&apos;s profile to see them here!
            </Text>
            <TouchableOpacity
              className="mt-8 bg-primary px-8 py-3 rounded-xl"
              onPress={() => router.push("/(tabs)/adopt")}
            >
              <Text className="text-white font-bold">Find Pets</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
