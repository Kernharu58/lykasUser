import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Keyboard,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PetCard from "../../components/PetCard";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateView";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

interface Pet {
  _id: string;
  name: string;
  breed: string;
  imageUrl: string;
  status: string;
}

// Helper function to match the getPets structure in your snippet
const getPets = async (params: { category?: string; search?: string }) => {
  const response = await api.get("/pets", { params });
  return response.data;
};

export default function Adopt() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined); // Added missing state
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 👉 Updated to use the requested fetchFilteredPets function
  const fetchFilteredPets = async () => {
    setLoading(true);
    try {
      setError(null);
      // Pass the state variables directly to the API function
      const data = await getPets({ 
        category: selectedCategory, 
        search: searchQuery 
      }); 
      
      setPets(data); // Set the exact data the server returns
      setFilteredPets(data); // Also update filtered list for UI rendering
    } catch (error) {
      console.error("Failed to fetch pets", error);
      setError("We could not load the pet list. Check your connection or try again.");
    } finally {
      setLoading(false);
      setRefreshing(false); // Ensure the refresh spinner stops
    }
  };

  // Trigger the new function when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFilteredPets();
    }, [selectedCategory]) // Refetch if category changes
  );

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery(""); 
    setShowSuggestions(false);
    fetchFilteredPets();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.length > 0) {
      setShowSuggestions(true);
      const lowerCaseText = text.toLowerCase();
      
      const filtered = pets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(lowerCaseText) ||
          pet.breed.toLowerCase().includes(lowerCaseText)
      );
      setFilteredPets(filtered);
    } else {
      setShowSuggestions(false);
      setFilteredPets(pets);
    }
  };

  const handleSelectSuggestion = (pet: Pet) => {
    setSearchQuery(pet.name);
    setShowSuggestions(false);
    setFilteredPets([pet]); 
    Keyboard.dismiss(); 
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setFilteredPets(pets);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-6 mt-4 mb-4">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primaryDeep} />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-darkBlue dark:text-white">Adoption</Text>
        <View style={{ width: 60 }} />
      </View>

      <View className="px-6 mb-4 z-50" style={{ zIndex: 50 }}>
        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <Ionicons name="search" size={20} color={COLORS.neutral} />
          <TextInput
            className="flex-1 ml-2 text-darkBlue dark:text-white font-medium"
            placeholder="Search by name or breed..."
            placeholderTextColor={COLORS.neutral}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.neutral} />
            </TouchableOpacity>
          )}
        </View>

        {showSuggestions && filteredPets.length > 0 && (
          <View 
            className="absolute top-16 left-6 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden" 
            style={{ elevation: 5, zIndex: 100 }}
          >
            {filteredPets.slice(0, 4).map((pet, index) => (
              <TouchableOpacity
                key={`suggestion-${pet._id}`}
                className={`px-4 py-3 flex-row items-center justify-between ${
                  index !== filteredPets.slice(0, 4).length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
                }`}
                onPress={() => handleSelectSuggestion(pet)}
              >
                <View>
                  <Text className="text-darkBlue dark:text-white font-bold">{pet.name}</Text>
                  <Text className="text-neutral text-xs dark:text-gray-400">{pet.breed}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={COLORS.gray300} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 155 }}
        keyboardShouldPersistTaps="handled" 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryDeep}
            colors={[COLORS.primaryDeep]}
          />
        }
      >
        {loading ? (
          <LoadingState message="Finding pets..." />
        ) : error ? (
          <ErrorState message={error} onAction={fetchFilteredPets} />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <PetCard
                  key={pet._id}
                  id={pet._id}
                  name={pet.name}
                  breed={pet.breed}
                  image={pet.imageUrl}
                  status={pet.status}
                />
              ))
            ) : (
              <EmptyState
                title="No pets found"
                message={searchQuery ? `No pets match "${searchQuery}". Try another name or breed.` : "No adoptable pets are available right now."}
                icon="search-outline"
                actionLabel="Clear Search"
                onAction={clearSearch}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
