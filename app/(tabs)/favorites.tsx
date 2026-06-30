import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../utils/colors";

const savedPets = [
  { id: "1", name: "Emma", breed: "Golden Retriever", age: "2 yrs", status: "Available" },
  { id: "2", name: "Luna", breed: "Persian Cat", age: "1 yr", status: "Fostering" },
];

export default function Favorites() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
        <View className="mt-4 mb-6">
          <Text className="text-3xl font-extrabold text-ink dark:text-white">Saved Pets</Text>
          <Text className="text-muted dark:text-gray-400 mt-2">Keep track of pets you want to revisit.</Text>
        </View>

        <TouchableOpacity className="mb-5 flex-row items-center justify-center rounded-2xl bg-primary py-4" onPress={() => router.push("/compare-pets" as any)}>
          <Ionicons name="git-compare-outline" size={20} color="white" />
          <Text className="ml-2 font-extrabold text-white">Compare Saved Pets</Text>
        </TouchableOpacity>

        <View className="gap-4">
          {savedPets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              className="flex-row items-center rounded-3xl border border-border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700"
              onPress={() => router.push(`/pets/${pet.id}`)}
            >
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-mintBg">
                <Ionicons name="paw" size={28} color={COLORS.primary} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-extrabold text-ink dark:text-white">{pet.name}</Text>
                <Text className="text-sm text-muted dark:text-gray-400">{pet.breed} - {pet.age}</Text>
                <Text className="mt-1 text-xs font-bold text-mintDeep">{pet.status}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.sand} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

