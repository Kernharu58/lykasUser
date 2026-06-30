import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PetCard from "../../components/PetCard";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { COLORS } from "../../utils/colors";

interface Pet {
  _id: string;
  name: string;
  breed: string;
  imageUrl: string;
  status: string;
  species?: string;
}

const fallbackPets: Pet[] = [
  { _id: "demo-emma", name: "Emma", breed: "Golden Retriever", imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600", status: "Available", species: "Dog" },
  { _id: "demo-luna", name: "Luna", breed: "Persian Cat", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600", status: "Available", species: "Cat" },
  { _id: "demo-milo", name: "Milo", breed: "Beagle", imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600", status: "Fostered", species: "Dog" },
  { _id: "demo-poppy", name: "Poppy", breed: "Holland Lop", imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600", status: "Available", species: "Rabbit" },
];

const categories = ["All", "Dog", "Cat", "Rabbit", "Other"];
const shortcuts = [
  { label: "Baby Book", icon: "book-outline", path: "/baby-book/demo-emma" },
  { label: "Foster Trial", icon: "home-outline", path: "/foster-dashboard" },
  { label: "Documents", icon: "document-text-outline", path: "/documents" },
  { label: "Payments", icon: "card-outline", path: "/payments" },
  { label: "Appointments", icon: "calendar-outline", path: "/my-appointments" },
  { label: "Emergency", icon: "alert-circle-outline", path: "/emergency-report" },
];

export default function Discover() {
  const router = useRouter();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const firstName = user?.displayName?.split(" ")[0] || "friend";

  const fetchPets = async () => {
    try {
      const response = await api.get("/pets");
      setPets(Array.isArray(response.data) && response.data.length > 0 ? response.data : fallbackPets);
    } catch {
      setPets(fallbackPets);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const visiblePets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesCategory = category === "All" || pet.species === category;
      const term = query.trim().toLowerCase();
      const matchesQuery = !term || `${pet.name} ${pet.breed}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [pets, category, query]);

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPets(); }} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      >
        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-bold uppercase tracking-widest text-primary">CarePaws</Text>
            <Text className="mt-1 text-3xl font-extrabold text-ink dark:text-white">Hi, {firstName}</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800 dark:border-gray-700" onPress={() => router.push("/notifications" as any)}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
              <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-warning" />
            </TouchableOpacity>
            <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800 dark:border-gray-700" onPress={() => router.push("/(tabs)/chat")}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="mt-3 text-lg font-semibold text-espresso dark:text-gray-200">Find your forever friend</Text>

        <View className="mt-5 flex-row items-center rounded-2xl border border-border bg-white px-4 py-3 dark:bg-gray-800 dark:border-gray-700">
          <Ionicons name="search" size={20} color={COLORS.sand} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search pets..."
            placeholderTextColor={COLORS.sand}
            className="ml-2 flex-1 text-ink dark:text-white font-medium"
            autoCorrect={false}
          />
          <TouchableOpacity className="rounded-full bg-mintBg px-3 py-1" onPress={() => setQuery("")}>
            <Text className="text-xs font-bold text-primary">Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          <View className="flex-row gap-2">
            {categories.map((item) => (
              <TouchableOpacity key={item} onPress={() => setCategory(item)} className={`rounded-full px-4 py-2 ${category === item ? "bg-primary" : "bg-white border border-border dark:bg-gray-800 dark:border-gray-700"}`}>
                <Text className={`font-bold ${category === item ? "text-white" : "text-muted dark:text-gray-300"}`}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="mt-6 rounded-3xl bg-primary p-5">
          <Text className="text-xl font-extrabold text-white">Adoption takes care, not guesswork.</Text>
          <Text className="mt-2 text-sm leading-5 text-white/90">Track applications, foster first, chat with staff, and keep health records after adoption.</Text>
          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity className="flex-1 rounded-xl bg-white py-3" onPress={() => router.push("/(tabs)/my-applications")}>
              <Text className="text-center font-bold text-primary">My Apps</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-xl border border-white py-3" onPress={() => router.push("/donate")}>
              <Text className="text-center font-bold text-white">Donate</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-6 flex-row flex-wrap justify-between">
          {shortcuts.map((item) => (
            <TouchableOpacity key={item.label} className="mb-3 w-[31%] items-center rounded-3xl border border-border bg-white p-3 dark:bg-gray-800 dark:border-gray-700" onPress={() => router.push(item.path as any)}>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-mintBg">
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <Text className="mt-2 text-center text-xs font-extrabold text-ink dark:text-white">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-7 mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-extrabold text-ink dark:text-white">Available pets</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/adopt")}>
            <Text className="font-bold text-primary">See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="mt-14 items-center">
            <ActivityIndicator color={COLORS.primary} />
            <Text className="mt-3 text-muted dark:text-gray-400">Finding pets near you...</Text>
          </View>
        ) : visiblePets.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {visiblePets.map((pet) => (
              <PetCard key={pet._id} id={pet._id} name={pet.name} breed={pet.breed} image={pet.imageUrl} status={pet.status} />
            ))}
          </View>
        ) : (
          <View className="mt-10 items-center rounded-3xl border border-dashed border-border bg-white p-8 dark:bg-gray-800 dark:border-gray-700">
            <Ionicons name="search-outline" size={44} color={COLORS.sand} />
            <Text className="mt-4 text-lg font-bold text-ink dark:text-white">No pets found</Text>
            <Text className="mt-1 text-center text-muted dark:text-gray-400">Try another search or clear your filters.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


