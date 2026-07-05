import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

// ─── Catalog ─────────────────────────────────────────────────
type ItemId =
  | "dog_food" | "cat_food" | "pet_treats" | "blankets"
  | "leashes"  | "toys"     | "grooming"   | "medicine" | "cleaning";

const GOODS_CATALOG: {
  id: ItemId;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  unit: string;
}[] = [
  { id: "dog_food",   label: "Dog Food",           icon: "nutrition-outline",  unit: "bag(s)"    },
  { id: "cat_food",   label: "Cat Food",           icon: "fish-outline",       unit: "bag(s)"    },
  { id: "pet_treats", label: "Pet Treats",         icon: "gift-outline",       unit: "pack(s)"   },
  { id: "blankets",   label: "Blankets",           icon: "bed-outline",        unit: "pc(s)"     },
  { id: "leashes",    label: "Leashes & Collars",  icon: "link-outline",       unit: "pc(s)"     },
  { id: "toys",       label: "Toys",               icon: "football-outline",   unit: "pc(s)"     },
  { id: "grooming",   label: "Grooming Supplies",  icon: "cut-outline",        unit: "set(s)"    },
  { id: "medicine",   label: "Medicine",           icon: "medical-outline",    unit: "box(es)"   },
  { id: "cleaning",   label: "Cleaning Supplies",  icon: "sparkles-outline",   unit: "bottle(s)" },
];

const DROP_OFF_OPTIONS = [
  {
    id:    "walk_in",
    label: "Walk-in drop-off",
    desc:  "Bring items anytime · Mon–Sat 8 AM – 5 PM",
    icon:  "walk-outline" as const,
  },
  {
    id:    "schedule",
    label: "Schedule a pickup",
    desc:  "We will arrange a free pickup from your location",
    icon:  "calendar-outline" as const,
  },
  {
    id:    "courier",
    label: "Ship via courier",
    desc:  "JRS / LBC / GrabExpress to our shelter address",
    icon:  "cube-outline" as const,
  },
];

// ─── Success screen ───────────────────────────────────────────
function SuccessScreen({ onDone }: { onDone: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900 items-center justify-center px-8">
      <View className="w-24 h-24 rounded-full bg-mintBg items-center justify-center mb-6">
        <Ionicons name="checkmark-circle" size={56} color={COLORS.primary} />
      </View>
      <Text className="text-3xl font-extrabold text-ink dark:text-white mb-2">
        Pledge received!
      </Text>
      <Text className="text-center text-muted dark:text-gray-400 text-base mb-8 leading-6">
        The shelter team will confirm your goods donation within 24 hours and
        coordinate the handover. Thank you — every item counts. 🐾
      </Text>
      <TouchableOpacity
        className="w-full rounded-2xl bg-primary py-4"
        onPress={onDone}
      >
        <Text className="text-center font-extrabold text-white text-base">
          Back to Home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Main screen ──────────────────────────────────────────────
export default function DonateGoods() {
  const router = useRouter();

  const [selected, setSelected] = useState<Partial<Record<ItemId, number>>>({});
  const [otherItem, setOtherItem] = useState("");
  const [dropOff, setDropOff]     = useState("walk_in");
  const [notes, setNotes]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const toggleItem = (id: ItemId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const changeQty = (id: ItemId, delta: number) => {
    Haptics.selectionAsync();
    setSelected(prev => {
      const cur  = prev[id] ?? 1;
      const next = Math.max(1, Math.min(99, cur + delta));
      return { ...prev, [id]: next };
    });
  };

  const hasItems =
    Object.keys(selected).length > 0 || otherItem.trim() !== "";

  const handleSubmit = async () => {
    if (!hasItems) {
      Alert.alert("Nothing selected", "Please pick at least one item to donate.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const items = GOODS_CATALOG
        .filter(g => selected[g.id] !== undefined)
        .map(g => ({
          name:     g.label,
          quantity: selected[g.id]!,
          unit:     g.unit,
        }));

      if (otherItem.trim()) {
        items.push({ name: otherItem.trim(), quantity: 1, unit: "pc(s)" });
      }

      await api.post("/donations/goods", { items, dropOff, notes });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Could not submit your pledge. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <SuccessScreen onDone={() => router.replace("/(tabs)")} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 mt-4 mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-ink dark:text-white">
          Donate Goods
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-mintBg items-center justify-center mb-3">
              <Ionicons name="heart-circle" size={48} color={COLORS.primary} />
            </View>
            <Text className="text-base text-center text-muted dark:text-gray-400 px-6 leading-5">
              Physical items go directly to animals in our shelter. Every
              donation counts.
            </Text>
          </View>

          {/* Item grid */}
          <Text className="mb-3 font-extrabold text-ink dark:text-white">
            What would you like to donate?
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {GOODS_CATALOG.map(item => {
              const isSelected = selected[item.id] !== undefined;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.75}
                  className={`items-center rounded-2xl border p-3 gap-1.5 ${
                    isSelected
                      ? "border-primary bg-mintBg"
                      : "border-border bg-white dark:bg-gray-800"
                  }`}
                  style={{ width: "30%" }}
                >
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center ${
                      isSelected ? "bg-primary" : "bg-mintBg"
                    }`}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isSelected ? COLORS.white : COLORS.primary}
                    />
                  </View>
                  <Text
                    className={`text-xs font-semibold text-center ${
                      isSelected ? "text-primary" : "text-ink dark:text-white"
                    }`}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>

                  {/* Quantity stepper */}
                  {isSelected && (
                    <View className="flex-row items-center gap-1.5">
                      <TouchableOpacity
                        onPress={() => changeQty(item.id, -1)}
                        className="w-5 h-5 rounded-full border border-primary bg-white items-center justify-center"
                      >
                        <Ionicons name="remove" size={11} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text className="text-xs font-extrabold text-primary w-4 text-center">
                        {selected[item.id]}
                      </Text>
                      <TouchableOpacity
                        onPress={() => changeQty(item.id, 1)}
                        className="w-5 h-5 rounded-full border border-primary bg-white items-center justify-center"
                      >
                        <Ionicons name="add" size={11} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Summary */}
          {Object.keys(selected).length > 0 && (
            <View className="rounded-2xl border border-border bg-white dark:bg-gray-800 p-4 mb-4">
              <Text className="font-extrabold text-ink dark:text-white mb-2">
                Your donation
              </Text>
              {GOODS_CATALOG.filter(g => selected[g.id] !== undefined).map(g => (
                <View key={g.id} className="flex-row justify-between mb-1.5">
                  <Text className="text-ink dark:text-white">{g.label}</Text>
                  <Text className="font-bold text-primary">
                    {selected[g.id]} {g.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Other items */}
          <Text className="mb-2 font-extrabold text-ink dark:text-white">
            Other items{" "}
            <Text className="font-normal text-muted">(optional)</Text>
          </Text>
          <TextInput
            value={otherItem}
            onChangeText={setOtherItem}
            placeholder="e.g. puppy pads, canned food…"
            placeholderTextColor={COLORS.mutedLight}
            returnKeyType="done"
            className="mb-5 rounded-2xl border border-border bg-white px-4 py-4 text-ink dark:bg-gray-800 dark:text-white"
          />

          {/* Drop-off */}
          <Text className="mb-3 font-extrabold text-ink dark:text-white">
            How will you donate?
          </Text>
          {DROP_OFF_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => {
                setDropOff(opt.id);
                Haptics.selectionAsync();
              }}
              className={`flex-row items-center rounded-2xl border p-4 mb-2.5 gap-3 ${
                dropOff === opt.id
                  ? "border-primary bg-mintBg"
                  : "border-border bg-white dark:bg-gray-800"
              }`}
            >
              <View
                className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
                  dropOff === opt.id ? "border-primary" : "border-border"
                }`}
              >
                {dropOff === opt.id && (
                  <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${
                    dropOff === opt.id
                      ? "text-primary"
                      : "text-ink dark:text-white"
                  }`}
                >
                  {opt.label}
                </Text>
                <Text className="text-xs text-muted mt-0.5">{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Shelter address */}
          <View className="flex-row items-start rounded-2xl border border-mint bg-mintBg p-4 mb-5 mt-1 gap-2">
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <View>
              <Text className="font-bold text-primary text-sm mb-1">
                Shelter address
              </Text>
              <Text className="text-sm text-primaryDeep leading-5">
                CarePaws Animal Shelter{"\n"}
                123 Shelter Lane, Quezon City{"\n"}
                Metro Manila · Mon–Sat 8 AM–5 PM
              </Text>
            </View>
          </View>

          {/* Notes */}
          <Text className="mb-2 font-extrabold text-ink dark:text-white">
            Notes{" "}
            <Text className="font-normal text-muted">(optional)</Text>
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions for the shelter team…"
            placeholderTextColor={COLORS.mutedLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="mb-5 rounded-2xl border border-border bg-white px-4 py-4 text-ink dark:bg-gray-800 dark:text-white"
            style={{ height: 88 }}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !hasItems}
            className={`rounded-2xl bg-primary py-4 ${!hasItems ? "opacity-40" : ""}`}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text className="text-center font-extrabold text-white text-base">
                Confirm Donation Pledge
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-center text-xs text-muted mt-3">
            The shelter team will confirm your pledge within 24 hours.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}