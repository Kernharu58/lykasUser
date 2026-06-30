import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PetCard from "../components/PetCard";
import { EmptyState, ErrorState, LoadingState } from "../components/StateView";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

interface Pet {
  _id: string;
  name: string;
  breed: string;
  imageUrl: string;
  status: string;
}

export default function Favorites() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setError(null);
        const response = await api.get("/auth/favorites");
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("Could not load your saved pets.");
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
          <Ionicons name="arrow-back" size={20} color={COLORS.primaryDeep} />
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
          <LoadingState message="Loading saved pets..." />
        ) : error ? (
          <ErrorState message={error} onAction={() => router.replace("/favorites" as any)} />
        ) : favorites.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {favorites.map((pet) => (
              <PetCard
                key={pet._id}
                id={pet._id}
                name={pet.name}
                breed={pet.breed}
                image={pet.imageUrl}
                status={pet.status}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No saved pets yet"
            message="Tap the heart on a pet profile to compare and revisit them here."
            icon="heart-dislike-outline"
            actionLabel="Find Pets"
            onAction={() => router.push("/(tabs)/adopt")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
