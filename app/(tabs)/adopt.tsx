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
  size?: string;
  temperament?: string;
  energyLevel?: string;
}

const SPECIES_OPTS = ["All", "Dog", "Cat", "Rabbit", "Other"];
const SIZE_OPTS    = ["All", "Small", "Medium", "Large"];
const ENERGY_OPTS  = ["All", "Low", "Medium", "High"];
const TEMP_OPTS    = ["All", "Calm", "Playful", "Shy", "Energetic", "Affectionate", "Independent"];

function FilterRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              className="px-4 py-2 rounded-full border"
              style={{
                backgroundColor: value === opt ? COLORS.primaryDeep : "white",
                borderColor: value === opt ? COLORS.primaryDeep : COLORS.border ?? "#E5E7EB",
              }}
            >
              <Text className="text-xs font-bold" style={{ color: value === opt ? "white" : COLORS.muted ?? "#6B7280" }}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function Adopt() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery]         = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize]         = useState("All");
  const [selectedEnergy, setSelectedEnergy]     = useState("All");
  const [selectedTemp, setSelectedTemp]         = useState("All");

  const fetchFilteredPets = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const params: Record<string, string> = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedSize !== "All") params.size = selectedSize;
      if (selectedEnergy !== "All") params.energyLevel = selectedEnergy;
      if (selectedTemp !== "All") params.temperament = selectedTemp;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await api.get("/pets", { params });
      setPets(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("We could not load the pet list. Check your connection or try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedSize, selectedEnergy, selectedTemp, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchFilteredPets();
    }, [fetchFilteredPets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    fetchFilteredPets();
  };

  const clearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const activeFilterCount = [selectedCategory, selectedSize, selectedEnergy, selectedTemp].filter((v) => v !== "All").length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-6 mt-4 mb-4">
        <TouchableOpacity className="flex-row items-center" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primaryDeep} />
          <Text className="text-primary font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-darkBlue dark:text-white">Adoption</Text>
        <TouchableOpacity
          onPress={() => setShowFilters((v) => !v)}
          className="flex-row items-center px-3 py-2 rounded-xl border"
          style={{
            borderColor: activeFilterCount > 0 ? COLORS.primaryDeep : "#E5E7EB",
            backgroundColor: activeFilterCount > 0 ? COLORS.primaryDeep : "white",
          }}
        >
          <Ionicons name="options-outline" size={16} color={activeFilterCount > 0 ? "white" : COLORS.neutral} />
          {activeFilterCount > 0 && (
            <Text className="text-xs font-bold text-white ml-1">{activeFilterCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View className="px-6 mb-3">
        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <Ionicons name="search" size={20} color={COLORS.neutral} />
          <TextInput
            className="flex-1 ml-2 text-darkBlue dark:text-white font-medium"
            placeholder="Search by name or breed..."
            placeholderTextColor={COLORS.neutral}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchFilteredPets}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.neutral} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters panel */}
      {showFilters && (
        <View className="px-6 pb-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <FilterRow label="Species" options={SPECIES_OPTS} value={selectedCategory} onChange={setSelectedCategory} />
          <FilterRow label="Size" options={SIZE_OPTS} value={selectedSize} onChange={setSelectedSize} />
          <FilterRow label="Energy Level" options={ENERGY_OPTS} value={selectedEnergy} onChange={setSelectedEnergy} />
          <FilterRow label="Temperament" options={TEMP_OPTS} value={selectedTemp} onChange={setSelectedTemp} />
          {activeFilterCount > 0 && (
            <TouchableOpacity
              onPress={() => { setSelectedCategory("All"); setSelectedSize("All"); setSelectedEnergy("All"); setSelectedTemp("All"); }}
              className="mt-2 py-2 rounded-xl items-center"
              style={{ backgroundColor: "#FEE2E2" }}
            >
              <Text className="text-red-600 font-bold text-sm">Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
        ) : pets.length > 0 ? (
          <View className="flex-row flex-wrap justify-between mt-3">
            {pets.map((pet) => (
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
          <View className="mt-6">
            <EmptyState
              title="No pets found"
              message={activeFilterCount > 0 || searchQuery ? "Try adjusting your filters or search query." : "No adoptable pets are available right now."}
              icon="search-outline"
              actionLabel={activeFilterCount > 0 || searchQuery ? "Clear Filters" : undefined}
              onAction={activeFilterCount > 0 || searchQuery ? () => { setSelectedCategory("All"); setSelectedSize("All"); setSelectedEnergy("All"); setSelectedTemp("All"); setSearchQuery(""); } : undefined}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
