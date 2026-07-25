import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

type ContentItem = {
  _id: string;
  type: "faq" | "policy" | "page" | "announcement";
  title: string;
  body: string;
  category: string;
};

export default function Help() {
  const router = useRouter();
  const [tab, setTab] = useState<"faq" | "policies">("faq");
  const [faqs, setFaqs] = useState<ContentItem[]>([]);
  const [policies, setPolicies] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      const [faqRes, policyRes] = await Promise.all([
        api.get("/content/public", { params: { type: "faq" } }),
        api.get("/content/public", { params: { type: "policy" } }),
      ]);
      setFaqs(faqRes.data || []);
      setPolicies(policyRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContent();
    }, [])
  );

  const groupedFaqs = faqs.reduce<Record<string, ContentItem[]>>((acc, item) => {
    const cat = item.category || "General";
    acc[cat] = acc[cat] || [];
    acc[cat].push(item);
    return acc;
  }, {});

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
          <Text className="text-2xl font-extrabold text-ink dark:text-white">Help & FAQ</Text>
          <Text className="text-xs font-bold text-muted">Answers and policies</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-4 gap-2">
        <TouchableOpacity
          onPress={() => setTab("faq")}
          className={`flex-1 py-3 rounded-2xl items-center ${tab === "faq" ? "bg-primary" : "bg-white border border-border"}`}
        >
          <Text className={`font-extrabold ${tab === "faq" ? "text-white" : "text-slate-600"}`}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("policies")}
          className={`flex-1 py-3 rounded-2xl items-center ${tab === "policies" ? "bg-primary" : "bg-white border border-border"}`}
        >
          <Text className={`font-extrabold ${tab === "policies" ? "text-white" : "text-slate-600"}`}>
            Policies
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchContent();
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : tab === "faq" ? (
          Object.keys(groupedFaqs).length === 0 ? (
            <View className="mt-16 items-center">
              <Ionicons name="help-circle-outline" size={48} color={COLORS.mutedLight} />
              <Text className="mt-3 font-bold text-muted">No FAQs published yet.</Text>
            </View>
          ) : (
            Object.entries(groupedFaqs).map(([category, list]) => (
              <View key={category} className="mb-6">
                <Text className="mb-3 ml-1 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                  {category}
                </Text>
                {list.map((item) => {
                  const isOpen = openId === item._id;
                  return (
                    <TouchableOpacity
                      key={item._id}
                      activeOpacity={0.8}
                      onPress={() => setOpenId(isOpen ? null : item._id)}
                      className="mb-3 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="flex-1 mr-3 font-extrabold text-ink dark:text-white">
                          {item.title}
                        </Text>
                        <Ionicons
                          name={isOpen ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={COLORS.muted}
                        />
                      </View>
                      {isOpen && (
                        <Text className="mt-3 text-sm leading-5 text-slate-600 dark:text-gray-300">
                          {item.body}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )
        ) : policies.length === 0 ? (
          <View className="mt-16 items-center">
            <Ionicons name="document-text-outline" size={48} color={COLORS.mutedLight} />
            <Text className="mt-3 font-bold text-muted">No policies published yet.</Text>
          </View>
        ) : (
          policies.map((item) => {
            const isOpen = openId === item._id;
            return (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.8}
                onPress={() => setOpenId(isOpen ? null : item._id)}
                className="mb-3 rounded-3xl border border-border bg-white p-4 dark:bg-gray-800 dark:border-gray-700"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mintBg">
                      <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                    </View>
                    <Text className="flex-1 font-extrabold text-ink dark:text-white">{item.title}</Text>
                  </View>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={COLORS.muted} />
                </View>
                {isOpen && (
                  <Text className="mt-3 text-sm leading-5 text-slate-600 dark:text-gray-300">{item.body}</Text>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* Contact fallback */}
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:info@carepaws.org")}
          className="mt-2 rounded-3xl bg-primary p-5 flex-row items-center"
        >
          <Ionicons name="mail-outline" size={22} color="white" />
          <View className="ml-3 flex-1">
            <Text className="font-extrabold text-white">Still need help?</Text>
            <Text className="text-white/80 text-xs mt-0.5">Email our team directly</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
