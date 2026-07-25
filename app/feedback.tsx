import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate } from "../utils/format";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

const TYPES: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "review",     label: "Review",     icon: "star-outline" },
  { key: "general",    label: "General",    icon: "chatbubble-outline" },
  { key: "suggestion", label: "Suggestion", icon: "bulb-outline" },
  { key: "complaint",  label: "Complaint",  icon: "alert-circle-outline" },
];

const statusMeta: Record<string, { color: string; bg: string; label: string }> = {
  new:        { color: COLORS.amber600, bg: COLORS.sandBg,  label: "Submitted" },
  in_review:  { color: COLORS.blue,     bg: "#EFF6FF",       label: "In Review" },
  responded:  { color: COLORS.primary,  bg: COLORS.mintBg,   label: "Responded" },
  resolved:   { color: COLORS.primary,  bg: COLORS.mintBg,   label: "Resolved" },
  archived:   { color: COLORS.muted,    bg: COLORS.gray100,  label: "Archived" },
};

function Stars({ value, onChange, size = 28 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} disabled={!onChange} onPress={() => onChange?.(n)} className="mr-1">
          <Ionicons
            name={n <= value ? "star" : "star-outline"}
            size={size}
            color={n <= value ? COLORS.amber : COLORS.mutedLight}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function Feedback() {
  const router = useRouter();
  const [tab, setTab] = useState<"submit" | "mine">("submit");

  // Submit form state
  const [type, setType] = useState("review");
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // My feedback list state
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMine = async () => {
    setLoading(true);
    try {
      const res = await api.get("/feedback/my");
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (tab === "mine") fetchMine();
    }, [tab])
  );

  const resetForm = () => {
    setType("review");
    setRating(0);
    setSubject("");
    setMessage("");
    setIsPublic(true);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Missing info", "Please fill in both a subject and a message.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/feedback", {
        type,
        rating: type === "review" ? rating || null : null,
        subject: subject.trim(),
        message: message.trim(),
        isPublic: type === "review" ? isPublic : false,
      });
      Alert.alert("Thank you!", "Your feedback has been submitted.");
      resetForm();
      setTab("mine");
    } catch (err: any) {
      Alert.alert("Submission Failed", err.response?.data?.message || "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-2xl font-extrabold text-ink dark:text-white">Feedback & Reviews</Text>
          <Text className="text-xs font-bold text-muted">Tell us how we&apos;re doing</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-4 gap-2">
        <TouchableOpacity
          onPress={() => setTab("submit")}
          className={`flex-1 py-3 rounded-2xl items-center ${tab === "submit" ? "bg-primary" : "bg-white border border-border"}`}
        >
          <Text className={`font-extrabold ${tab === "submit" ? "text-white" : "text-slate-600"}`}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("mine")}
          className={`flex-1 py-3 rounded-2xl items-center ${tab === "mine" ? "bg-primary" : "bg-white border border-border"}`}
        >
          <Text className={`font-extrabold ${tab === "mine" ? "text-white" : "text-slate-600"}`}>My Submissions</Text>
        </TouchableOpacity>
      </View>

      {tab === "submit" ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}>
          {/* Type selector */}
          <Text className="mb-2 ml-1 text-xs font-extrabold uppercase tracking-widest text-gray-400">Type</Text>
          <View className="flex-row flex-wrap mb-5 gap-2">
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setType(t.key)}
                className={`flex-row items-center px-4 py-2.5 rounded-2xl border ${
                  type === t.key ? "bg-mintBg border-primary" : "bg-white border-border"
                }`}
              >
                <Ionicons name={t.icon} size={16} color={type === t.key ? COLORS.primary : COLORS.muted} />
                <Text className={`ml-2 font-bold ${type === t.key ? "text-primary" : "text-slate-600"}`}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating (reviews only) */}
          {type === "review" && (
            <View className="mb-5 rounded-3xl border border-border bg-white p-5 dark:bg-gray-800">
              <Text className="mb-3 font-extrabold text-ink dark:text-white">Your Rating</Text>
              <Stars value={rating} onChange={setRating} />
            </View>
          )}

          {/* Subject */}
          <Text className="mb-2 ml-1 text-xs font-extrabold uppercase tracking-widest text-gray-400">Subject</Text>
          <TextInput
            className="mb-5 rounded-2xl border border-border bg-white px-4 py-3 text-ink dark:bg-gray-800 dark:text-white"
            value={subject}
            onChangeText={setSubject}
            placeholder="A short summary"
            placeholderTextColor={COLORS.mutedLight}
          />

          {/* Message */}
          <Text className="mb-2 ml-1 text-xs font-extrabold uppercase tracking-widest text-gray-400">Message</Text>
          <TextInput
            className="mb-5 rounded-2xl border border-border bg-white px-4 py-3 text-ink dark:bg-gray-800 dark:text-white"
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us more..."
            placeholderTextColor={COLORS.mutedLight}
            multiline
            numberOfLines={5}
            style={{ minHeight: 120, textAlignVertical: "top" }}
          />

          {/* Public toggle for reviews */}
          {type === "review" && (
            <TouchableOpacity
              onPress={() => setIsPublic(!isPublic)}
              className="mb-6 flex-row items-center rounded-2xl border border-border bg-white p-4 dark:bg-gray-800"
            >
              <Ionicons
                name={isPublic ? "checkbox" : "square-outline"}
                size={22}
                color={isPublic ? COLORS.primary : COLORS.mutedLight}
              />
              <Text className="ml-3 flex-1 text-sm font-semibold text-slate-600 dark:text-gray-300">
                Share this review publicly as a success story
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="items-center rounded-2xl bg-primary py-4"
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-extrabold text-white">Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMine();
              }}
              colors={[COLORS.primary]}
            />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : items.length === 0 ? (
            <View className="mt-16 items-center">
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.mutedLight} />
              <Text className="mt-3 font-bold text-muted">You haven&apos;t submitted any feedback yet.</Text>
            </View>
          ) : (
            items.map((item) => {
              const meta = statusMeta[item.status] || statusMeta.new;
              return (
                <View
                  key={item._id}
                  className="mb-3 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800 dark:border-gray-700"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="flex-1 font-extrabold text-ink dark:text-white" numberOfLines={1}>
                      {item.subject}
                    </Text>
                    <View className="rounded-full px-3 py-1" style={{ backgroundColor: meta.bg }}>
                      <Text className="text-xs font-extrabold" style={{ color: meta.color }}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                  {item.rating ? <Stars value={item.rating} size={16} /> : null}
                  <Text className="mt-2 text-sm text-slate-600 dark:text-gray-300">{item.message}</Text>
                  <Text className="mt-2 text-xs font-bold text-muted">{formatDate(item.createdAt)}</Text>

                  {item.adminResponse ? (
                    <View className="mt-3 rounded-2xl bg-mintBg p-3">
                      <Text className="text-xs font-extrabold text-primary mb-1">Shelter Response</Text>
                      <Text className="text-sm text-slate-700">{item.adminResponse}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
