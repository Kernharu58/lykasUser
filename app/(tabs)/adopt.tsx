import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PetCard from "../../components/PetCard";
import api from "./../utils/api";

interface Pet {
  _id: string;
  name: string;
  breed: string;
  imageUrl: string;
}

export default function Adopt() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true); // For the initial load
  const [refreshing, setRefreshing] = useState(false);

  // We moved this outside the useEffect so the onRefresh function can use it too!
  const fetchPets = async () => {
    try {
      const response = await api.get("/pets");
      setPets(response.data);
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop the refreshing spinner
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // 👉 The function that runs when you pull down
  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-6 mt-4 mb-6">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#2D6A4F" />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-darkBlue">Adoption</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2D6A4F"
            colors={["#2D6A4F"]}
          />
        }
      >
        {loading ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color="#2D6A4F" />
            <Text className="text-neutral mt-4">Finding furry friends...</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <PetCard
                  key={pet._id}
                  id={pet._id}
                  name={pet.name}
                  breed={pet.breed}
                  image={pet.imageUrl}
                />
              ))
            ) : (
              <Text className="text-neutral text-center w-full mt-10">
                No pets available for adoption right now. Pull down to refresh!
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
