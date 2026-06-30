import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

const COMPARE_FIELDS = [
  { key: "species",    label: "Species",     fn: (p: any) => p.species        || "—" },
  { key: "breed",      label: "Breed",       fn: (p: any) => p.breed          || "—" },
  { key: "age",        label: "Age",         fn: (p: any) => p.age ? `${p.age} yr${p.age !== 1 ? "s" : ""}` : "—" },
  { key: "gender",     label: "Gender",      fn: (p: any) => p.gender         || "—" },
  { key: "size",       label: "Size",        fn: (p: any) => p.size           || "—" },
  { key: "status",     label: "Status",      fn: (p: any) => p.status         || "—" },
  { key: "vaccinated", label: "Vaccinated",  fn: (p: any) => p.vaccinated ? "Yes" : "Unknown" },
  { key: "neutered",   label: "Neutered",    fn: (p: any) => p.neutered   ? "Yes" : "Unknown" },
];

export default function ComparePets() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selected, setSelected]   = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      // Get favorited pets — adjust endpoint if different in your petController
      const res = await api.get("/pets?favorited=true&limit=20");
      const pets = res.data?.pets || res.data || [];
      setFavorites(pets);
      // Auto-select first two
      if (pets.length >= 2 && selected.length === 0) {
        setSelected([pets[0]._id, pets[1]._id]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchFavorites(); }, []));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 2) return [prev[1], id]; // replace oldest
      return [...prev, id];
    });
  };

  const petA = favorites.find(p => p._id === selected[0]);
  const petB = favorites.find(p => p._id === selected[1]);

  if (loading) return (
    <SafeAreaView className="flex-1 bg-bgSoft items-center justify-center">
      <ActivityIndicator size="large" color={COLORS.primary} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-ink dark:text-white">Compare Pets</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} colors={[COLORS.primary]} />}
      >
        {favorites.length === 0 ? (
          <View className="items-center mt-16">
            <Ionicons name="heart-outline" size={64} color={COLORS.border} />
            <Text className="mt-4 text-lg font-extrabold text-ink dark:text-white">No saved pets yet</Text>
            <Text className="mt-2 text-sm text-muted text-center">Save pets to favorites to compare them here.</Text>
            <TouchableOpacity className="mt-6 rounded-2xl bg-primary px-8 py-4" onPress={() => router.push("/(tabs)/adopt" as any)}>
              <Text className="font-extrabold text-white">Browse Pets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Pet selector */}
            <Text className="mb-3 font-extrabold text-ink dark:text-white">
              Select 2 pets to compare
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-3">
                {favorites.map(pet => {
                  const isSelected = selected.includes(pet._id);
                  const selIndex   = selected.indexOf(pet._id);
                  return (
                    <TouchableOpacity key={pet._id} onPress={() => toggleSelect(pet._id)}
                      className={`items-center rounded-2xl border-2 px-4 py-3 ${isSelected ? "border-primary bg-mintBg" : "border-border bg-white dark:bg-gray-800"}`}>
                      {isSelected && (
                        <View className="absolute -top-2 -right-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Text className="text-xs font-bold text-white">{selIndex + 1}</Text>
                        </View>
                      )}
                      <Text className="font-extrabold text-ink dark:text-white">{pet.name}</Text>
                      <Text className="text-xs text-muted mt-0.5">{pet.species}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Comparison table */}
            {petA && petB ? (
              <View className="rounded-3xl border border-border bg-white overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {/* Header */}
                <View className="flex-row border-b border-border bg-cardBg dark:bg-gray-700 p-4">
                  <Text className="w-28 font-extrabold text-muted">Feature</Text>
                  <Text className="flex-1 font-extrabold text-primary">{petA.name}</Text>
                  <Text className="flex-1 font-extrabold text-primary">{petB.name}</Text>
                </View>

                {COMPARE_FIELDS.map(({ key, label, fn }, idx) => {
                  const valA = fn(petA);
                  const valB = fn(petB);
                  const match = valA === valB;
                  return (
                    <View key={key} className={`flex-row p-4 ${idx % 2 === 0 ? "" : "bg-offWhite dark:bg-gray-750"} border-b border-gray100 dark:border-gray-700`}>
                      <Text className="w-28 font-bold text-muted">{label}</Text>
                      <Text className="flex-1 font-extrabold text-ink dark:text-white">{valA}</Text>
                      <Text className={`flex-1 font-extrabold ${match ? "text-ink dark:text-white" : "text-warning"}`}>{valB}</Text>
                    </View>
                  );
                })}

                {/* Action buttons */}
                <View className="flex-row gap-3 p-4">
                  <TouchableOpacity className="flex-1 rounded-2xl bg-primary py-3"
                    onPress={() => router.push(`/pets/${petA._id}` as any)}>
                    <Text className="text-center font-bold text-white">View {petA.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 rounded-2xl border border-primary py-3"
                    onPress={() => router.push(`/pets/${petB._id}` as any)}>
                    <Text className="text-center font-bold text-primary">View {petB.name}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="items-center py-10">
                <Text className="text-muted">Select 2 pets above to see comparison</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
