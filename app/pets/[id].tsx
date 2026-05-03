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
  status: string;
}

export default function PetProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // 👉 ALL HOOKS MUST BE AT THE TOP
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        setError(null);
        
        // Validate ID format
        if (!id || typeof id !== 'string') {
          setError("Invalid pet ID");
          setLoading(false);
          return;
        }
        
        const response = await api.get(`/pets/${id}`);
        setPet(response.data);
      } catch (error: any) {
        console.error("Error fetching pet details:", error);
        
        // Provide specific error messages
        if (error.response?.status === 404) {
          setError("Pet not found");
        } else if (error.response?.status === 400) {
          setError("Invalid pet ID");
        } else if (error.response?.status === 500) {
          setError("Server error loading pet details");
        } else {
          setError("Failed to load pet details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPetDetails();
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      const response = await api.post(`/auth/favorites/${id}`);
      setIsFavorite(!isFavorite);
      Alert.alert("Success", response.data.message);
    } catch (error) {
      Alert.alert("Error", "Could not update favorites");
    }
  };

  // --- 1. Loading State ---
  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text className="text-neutral mt-4">Fetching details...</Text>
      </View>
    );
  }

  // --- 2. Error State ---
  if (error) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-xl font-bold text-darkBlue dark:text-white mt-4 mb-2">
          Error Loading Pet
        </Text>
        <Text className="text-center text-neutral dark:text-gray-300 mb-6">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-primary py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 3. Not Found State ---
  if (!pet) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center px-6">
        <Text className="text-xl font-bold text-darkBlue dark:text-white mb-4">
          Pet not found
        </Text>
        <TouchableOpacity
          className="bg-primary py-3 px-6 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAdopt = async () => {
    try {
      const response = await api.post(`/pets/${id}/adopt`);
      Alert.alert("Success", response.data.message);
      router.replace("/my-pets"); // Redirect to My Pets screen
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Adoption failed");
    }
  };
  // --- 3. Success State ---
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Hero Image & Header Buttons */}
      <View className="relative w-full h-80">
        <Image
          source={{ uri: pet.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <SafeAreaView className="absolute top-0 left-0 right-0 px-4 pt-2 flex-row justify-between">
          <TouchableOpacity
            className="w-10 h-10 bg-white/80 dark:bg-gray-300/80 rounded-full items-center justify-center shadow-sm"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1B2A49" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 bg-white/80 dark:bg-gray-300/80 rounded-full items-center justify-center shadow-sm"
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#EF4444" : "#1B2A49"}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Info Container */}
      <ScrollView
        className="flex-1 bg-white dark:bg-gray-900 -mt-8 rounded-t-3xl px-6 pt-8"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-3xl font-bold text-darkBlue dark:text-white">
            {pet.name}
          </Text>
          <Ionicons
            name={pet.gender === "Female" ? "female" : "male"}
            size={24}
            color="#D08C60"
          />
        </View>

        <Text className="text-warnBrown font-medium text-lg mb-6">
          {pet.breed}
        </Text>

        {/* Stats Row */}
        <View className="flex-row justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <View className="items-center flex-1 border-r border-gray-200 dark:border-gray-600">
            <Text className="text-neutral text-xs mb-1">Age</Text>
            <Text className="text-darkBlue dark:text-white font-bold">
              {pet.age}
            </Text>
          </View>
          <View className="items-center flex-1 border-r border-gray-200 dark:border-gray-600">
            <Text className="text-neutral text-xs mb-1">Gender</Text>
            <Text className="text-darkBlue dark:text-white font-bold">
              {pet.gender}
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-neutral text-xs mb-1">Weight</Text>
            <Text className="text-darkBlue dark:text-white font-bold">
              {pet.weight}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-darkBlue dark:text-white mb-2">
            Health Status
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="medkit" size={20} color="#2D6A4F" />
            <Text className="text-darkBlue dark:text-gray-300 ml-2 font-medium">
              {pet.healthStatus}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-darkBlue dark:text-white mb-2">
            About {pet.name}
          </Text>
          <Text className="text-neutral dark:text-gray-400 leading-6 text-base">
            {pet.description}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex-row justify-between ${
          Platform.OS === "ios" ? "pb-8" : ""
        }`}
      >
        <TouchableOpacity
          className="bg-white dark:bg-gray-800 border-2 border-primary rounded-xl justify-center items-center w-[15%]"
          onPress={() => router.push("/appointments")}
        >
          <Ionicons name="calendar" size={24} color="#2D6A4F" />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary py-4 rounded-xl flex-1 ml-4 items-center shadow-sm"
          onPress={() => router.push(`/pets/apply/${id}`)}
        >
          <Text className="text-white font-bold text-base">
            Apply for Adoption
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
