import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";

const CATEGORIES = ["General", "Milestone", "Health", "Funny Moment", "Training", "First Time"];

const categoryIcon: Record<string, string> = {
  Milestone:      "ribbon-outline",
  Health:         "medical-outline",
  "Funny Moment": "happy-outline",
  Training:       "barbell-outline",
  "First Time":   "star-outline",
  General:        "document-text-outline",
};

const categoryColor: Record<string, string> = {
  Milestone:      "#8B5CF6",
  Health:         "#EF4444",
  "Funny Moment": "#F59E0B",
  Training:       "#3B82F6",
  "First Time":   "#EC4899",
  General:        "#6B7280",
};

export default function BabyBook() {
  const router   = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [entries, setEntries]         = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [filterCat, setFilterCat]     = useState("All");

  // Add entry modal
  const [showModal, setShowModal]     = useState(false);
  const [entryTitle, setEntryTitle]   = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entryCategory, setEntryCategory] = useState("General");
  const [saving, setSaving]           = useState(false);

  /* ── Fetch ───────────────────────────────────────────── */
  const fetchAll = async () => {
    try {
      const [bbRes, medRes] = await Promise.allSettled([
        api.get(`/baby-book/${petId}`),
        api.get(`/medical/vaccinations/${petId}`),
      ]);
      if (bbRes.status  === "fulfilled") setEntries(bbRes.value.data.entries || bbRes.value.data || []);
      if (medRes.status === "fulfilled") setVaccinations(medRes.value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, [petId]));

  /* ── Add entry ───────────────────────────────────────── */
  const handleAddEntry = async () => {
    if (!entryTitle.trim()) { Alert.alert("Required", "Please enter a title."); return; }
    setSaving(true);
    try {
      const res = await api.post("/baby-book", {
        petId,
        title:    entryTitle.trim(),
        content:  entryContent.trim(),
        category: entryCategory,
      });
      setEntries(prev => [res.data.entry || res.data, ...prev]);
      setShowModal(false);
      setEntryTitle("");
      setEntryContent("");
      setEntryCategory("General");
      Alert.alert("Added!", "Baby book entry saved.");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not save entry.");
    } finally { setSaving(false); }
  };

  /* ── Delete entry ────────────────────────────────────── */
  const handleDelete = (id: string) => {
    Alert.alert("Delete Entry", "Remove this entry from the baby book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/baby-book/entry/${id}`);
            setEntries(prev => prev.filter(e => e._id !== id));
          } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete.");
          }
        },
      },
    ]);
  };

  const visibleEntries = filterCat === "All"
    ? entries
    : entries.filter(e => e.category === filterCat);

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] items-center justify-center">
      <ActivityIndicator size="large" color="#D4622A" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 mt-4 mb-5">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E8E4DC] dark:bg-gray-800">
            <Ionicons name="arrow-back" size={20} color="#D4622A" />
          </TouchableOpacity>
          <View className="ml-4">
            <Text className="text-2xl font-extrabold text-[#2C2C2C] dark:text-white">Baby Book</Text>
            <Text className="text-xs font-bold text-[#B0A898]">{entries.length} entries</Text>
          </View>
        </View>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-[#D4622A]"
          onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAll(); }}
            colors={["#D4622A"]}
          />
        }
      >
        {/* Hero banner */}
        <View className="mx-6 rounded-3xl bg-[#D4622A] p-5 mb-5">
          <Text className="text-2xl font-extrabold text-white">Pet Memory Book 🐾</Text>
          <Text className="mt-2 text-sm leading-5 text-white/90">
            Milestones, health updates, funny moments, and shelter follow-ups — all in one place.
          </Text>
          <View className="mt-4 flex-row gap-4">
            <View>
              <Text className="text-2xl font-extrabold text-white">{entries.length}</Text>
              <Text className="text-xs text-white/80">entries</Text>
            </View>
            <View>
              <Text className="text-2xl font-extrabold text-white">{vaccinations.length}</Text>
              <Text className="text-xs text-white/80">vaccines</Text>
            </View>
          </View>
        </View>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-5">
          <View className="flex-row gap-2">
            {["All", ...CATEGORIES].map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setFilterCat(cat)}
                className={`rounded-full px-4 py-2 ${filterCat === cat ? "bg-[#D4622A]" : "bg-white border border-[#E8E4DC] dark:bg-gray-800"}`}>
                <Text className={`text-xs font-extrabold ${filterCat === cat ? "text-white" : "text-[#7A7068] dark:text-gray-300"}`}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Timeline entries */}
        <View className="px-6 gap-3">
          {visibleEntries.length === 0 ? (
            <View className="items-center mt-10">
              <Ionicons name="book-outline" size={56} color="#E8E4DC" />
              <Text className="mt-4 font-extrabold text-[#2C2C2C] dark:text-white">No entries yet</Text>
              <Text className="mt-2 text-sm text-[#7A7068] text-center">
                Tap the + button to add your first memory.
              </Text>
            </View>
          ) : (
            visibleEntries.map(entry => {
              const color = categoryColor[entry.category] || "#6B7280";
              const icon  = categoryIcon[entry.category]  || "document-text-outline";
              return (
                <View
                  key={entry._id}
                  className="rounded-3xl bg-white border border-[#E8E4DC] p-4 dark:bg-gray-800 dark:border-gray-700">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: color + "20" }}>
                        <Ionicons name={icon as any} size={18} color={color} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
                          {entry.category}
                        </Text>
                        <Text className="font-extrabold text-[#2C2C2C] dark:text-white mt-0.5">{entry.title}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(entry._id)} className="p-1">
                      <Ionicons name="trash-outline" size={16} color="#B0A898" />
                    </TouchableOpacity>
                  </View>

                  {entry.content ? (
                    <Text className="mt-3 text-sm leading-5 text-[#7A7068] dark:text-gray-400">
                      {entry.content}
                    </Text>
                  ) : null}

                  <Text className="mt-3 text-xs text-[#B0A898]">
                    {new Date(entry.date || entry.createdAt).toLocaleDateString("en-PH", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                    {entry.addedBy?.displayName ? ` · by ${entry.addedBy.displayName}` : ""}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Vaccinations section */}
        {vaccinations.length > 0 && (
          <View className="px-6 mt-7">
            <Text className="mb-3 text-xl font-extrabold text-[#2C2C2C] dark:text-white">Vaccinations</Text>
            <View className="gap-3">
              {vaccinations.map(v => {
                const isDue = v.nextDueDate && new Date(v.nextDueDate) <= new Date();
                return (
                  <View
                    key={v._id}
                    className="flex-row items-center rounded-3xl bg-white border border-[#E8E4DC] p-4 dark:bg-gray-800">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5EDD6]">
                      <Ionicons name="medical" size={20} color="#D4622A" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="font-extrabold text-[#2C2C2C] dark:text-white">{v.vaccineName}</Text>
                      <Text className="text-xs text-[#7A7068] mt-0.5">
                        Given: {new Date(v.dateGiven).toLocaleDateString()}
                      </Text>
                      {v.nextDueDate && (
                        <Text className="text-xs text-[#7A7068]">
                          Next due: {new Date(v.nextDueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <Text className={`text-xs font-bold ${isDue ? "text-red-500" : "text-[#1E6B45]"}`}>
                      {isDue ? "Overdue" : "Current"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick actions */}
        <View className="mx-6 mt-6 flex-row gap-3">
          <TouchableOpacity
            className="flex-1 rounded-2xl bg-[#D4622A] py-4"
            onPress={() => router.push(`/health/${petId}` as any)}>
            <Text className="text-center font-extrabold text-white">Health Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-2xl border border-[#D4622A] py-4"
            onPress={() => router.push("/monitoring-report" as any)}>
            <Text className="text-center font-extrabold text-[#D4622A]">Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Entry Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-[#FDFAF4] dark:bg-gray-900">
          <View className="flex-row items-center justify-between px-6 mt-4 mb-6">
            <Text className="text-2xl font-extrabold text-[#2C2C2C] dark:text-white">New Entry</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#7A7068" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
            <Text className="mb-2 font-extrabold text-[#2C2C2C] dark:text-white">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-2">
                {CATEGORIES.map(cat => {
                  const color = categoryColor[cat];
                  const active = entryCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setEntryCategory(cat)}
                      className="rounded-2xl px-4 py-2 border"
                      style={{
                        backgroundColor: active ? color : "white",
                        borderColor: active ? color : "#E8E4DC",
                      }}>
                      <Text
                        className="text-xs font-extrabold"
                        style={{ color: active ? "white" : "#7A7068" }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="mb-2 font-extrabold text-[#2C2C2C] dark:text-white">Title *</Text>
            <TextInput
              value={entryTitle}
              onChangeText={setEntryTitle}
              placeholder="e.g. First time playing outside!"
              placeholderTextColor="#B0A898"
              className="mb-5 rounded-2xl border border-[#E8E4DC] bg-white px-4 py-4 text-[#2C2C2C] dark:bg-gray-800 dark:text-white"
            />

            <Text className="mb-2 font-extrabold text-[#2C2C2C] dark:text-white">Details (optional)</Text>
            <TextInput
              value={entryContent}
              onChangeText={setEntryContent}
              placeholder="Share what happened..."
              placeholderTextColor="#B0A898"
              multiline
              textAlignVertical="top"
              className="mb-6 min-h-[120px] rounded-2xl border border-[#E8E4DC] bg-white px-4 py-4 text-[#2C2C2C] dark:bg-gray-800 dark:text-white"
            />

            <TouchableOpacity
              className="rounded-2xl bg-[#D4622A] py-4"
              onPress={handleAddEntry}
              disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-center font-extrabold text-white">Save Entry</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
