import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../utils/api";
import { COLORS } from "../../../utils/colors";

const GREEN = COLORS.primary;
const ORANGE = COLORS.accentOrange;

export default function AdoptionApplication() {
  const router = useRouter();
  const { id, type: typeParam } = useLocalSearchParams<{ id: string; type?: string }>();

  // 'adoption' or 'foster' — set by the Foster button via ?type=foster
  const isFoster = typeParam === "foster";

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  // adoption: housing type selector; foster: availability period selector
  const [housing, setHousing] = useState("House");
  const [fosterPeriod, setFosterPeriod] = useState("1 month");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const accentColor = isFoster ? ORANGE : GREEN;
  const bgLight = isFoster ? COLORS.blush : COLORS.bgSoft;
  const borderColor = isFoster ? COLORS.blushBorder : COLORS.border;

  const progress = useMemo(() => (step / 3) * 100, [step]);
  const canContinue =
    step === 1 ? phone.trim() && address.trim()
    : step === 2 ? experience.trim()
    : reason.trim();

  const handleSubmit = async () => {
    if (!phone || !address || !experience || !reason) {
      Alert.alert("Required", "Please complete all sections before submitting.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        phone,
        address,
        experience: isFoster
          ? `Availability: ${fosterPeriod}. ${experience}. Commitment: ${reason}`
          : `${housing}. ${experience}. Reason: ${reason}`,
        type: isFoster ? "foster" : "adoption",
      };
      if (isFoster) body.fosterPeriod = fosterPeriod;

      await api.post(`/pets/${id}/adopt`, body);

      Alert.alert(
        isFoster ? "Foster application submitted" : "Application submitted",
        isFoster
          ? "Shelter staff will review your foster commitment and update you in My Apps."
          : "We'll review your application and update you in My Apps.",
        [{ text: "Track My Application", onPress: () => router.replace("/(tabs)/my-applications") }],
      );
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (!canContinue) {
      Alert.alert("Almost there", "Please complete this section first.");
      return;
    }
    if (step < 3) setStep((v) => v + 1);
    else handleSubmit();
  };

  return (
    <SafeAreaView className="flex-1 dark:bg-gray-900" style={{ backgroundColor: bgLight }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-row items-center px-6 mt-4 mb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white border"
            style={{ borderColor }}
          >
            <Ionicons name="arrow-back" size={20} color={accentColor} />
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {isFoster ? "Foster Application" : "Adoption Application"}
            </Text>
            <Text className="text-xs font-bold text-gray-500">Step {step} of 3</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="font-bold" style={{ color: accentColor }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
          {/* Progress bar */}
          <View className="mb-6 h-3 rounded-full overflow-hidden" style={{ backgroundColor: borderColor }}>
            <View className="h-3 rounded-full" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
          </View>

          <View className="rounded-3xl bg-white border p-5 shadow-sm dark:bg-gray-800" style={{ borderColor }}>

            {/* ── Step 1: Personal details ─────────────────────────────── */}
            {step === 1 && (
              <View>
                <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">Personal details</Text>
                <Text className="mt-2 text-gray-500 dark:text-gray-400 leading-5">
                  {isFoster
                    ? "Staff will use this to coordinate the foster handover."
                    : "Staff will use this to coordinate screening and home visit scheduling."}
                </Text>
                <Text className="mt-6 mb-2 font-extrabold text-gray-900 dark:text-white">Phone Number</Text>
                <TextInput
                  className="rounded-2xl border px-4 py-4 text-gray-900 dark:text-white dark:bg-gray-700"
                  style={{ backgroundColor: bgLight, borderColor }}
                  placeholder="+63 912 345 6789"
                  placeholderTextColor={COLORS.mutedLight}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <Text className="mt-5 mb-2 font-extrabold text-gray-900 dark:text-white">Home Address / City</Text>
                <TextInput
                  className="rounded-2xl border px-4 py-4 text-gray-900 dark:text-white dark:bg-gray-700"
                  style={{ backgroundColor: bgLight, borderColor }}
                  placeholder="Angeles City, Pampanga"
                  placeholderTextColor={COLORS.mutedLight}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            )}

            {/* ── Step 2: Living situation / Foster period ──────────────── */}
            {step === 2 && (
              <View>
                <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {isFoster ? "Foster details" : "Living situation"}
                </Text>
                <Text className="mt-2 text-gray-500 dark:text-gray-400 leading-5">
                  {isFoster
                    ? "Tell us about the foster period and your home setup."
                    : "Help us understand if this pet fits your home and routine."}
                </Text>

                {isFoster ? (
                  <>
                    <Text className="mt-6 mb-3 font-extrabold text-gray-900 dark:text-white">Availability period</Text>
                    <View className="flex-row gap-2">
                      {["1 month", "2 months", "Flexible"].map((item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setFosterPeriod(item)}
                          className="flex-1 rounded-2xl py-3"
                          style={{
                            backgroundColor: fosterPeriod === item ? ORANGE : "white",
                            borderWidth: fosterPeriod === item ? 0 : 1,
                            borderColor,
                          }}
                        >
                          <Text className="text-center font-bold" style={{ color: fosterPeriod === item ? "white" : COLORS.taupe }}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <Text className="mt-6 mb-3 font-extrabold text-gray-900 dark:text-white">Housing type</Text>
                    <View className="flex-row gap-2">
                      {["House", "Apartment", "Condo"].map((item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setHousing(item)}
                          className="flex-1 rounded-2xl py-3"
                          style={{
                            backgroundColor: housing === item ? GREEN : bgLight,
                            borderWidth: housing === item ? 0 : 1,
                            borderColor,
                          }}
                        >
                          <Text className="text-center font-bold" style={{ color: housing === item ? "white" : COLORS.muted }}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <Text className="mt-5 mb-2 font-extrabold text-gray-900 dark:text-white">
                  {isFoster ? "Your home & schedule" : "Experience & household"}
                </Text>
                <TextInput
                  className="min-h-[120px] rounded-2xl border px-4 py-4 text-gray-900 dark:text-white dark:bg-gray-700"
                  style={{ backgroundColor: bgLight, borderColor }}
                  placeholder={
                    isFoster
                      ? "Tell us about your home, daily schedule, and any pet care experience."
                      : "Tell us about your schedule, other pets, children, and pet care experience."
                  }
                  placeholderTextColor={COLORS.mutedLight}
                  multiline
                  textAlignVertical="top"
                  value={experience}
                  onChangeText={setExperience}
                />
              </View>
            )}

            {/* ── Step 3: Commitment / Review ───────────────────────────── */}
            {step === 3 && (
              <View>
                <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {isFoster ? "Foster commitment" : "Review commitment"}
                </Text>
                <Text className="mt-2 text-gray-500 dark:text-gray-400 leading-5">
                  {isFoster
                    ? "Share why you'd be a great temporary home for this pet."
                    : "One last note helps staff make a careful adoption decision."}
                </Text>
                <Text className="mt-6 mb-2 font-extrabold text-gray-900 dark:text-white">
                  {isFoster ? "Why do you want to foster?" : "Why this pet?"}
                </Text>
                <TextInput
                  className="min-h-[130px] rounded-2xl border px-4 py-4 text-gray-900 dark:text-white dark:bg-gray-700"
                  style={{ backgroundColor: bgLight, borderColor }}
                  placeholder={
                    isFoster
                      ? "Explain your motivation and what you can offer during the foster period."
                      : "Share why this pet feels like the right match."
                  }
                  placeholderTextColor={COLORS.mutedLight}
                  multiline
                  textAlignVertical="top"
                  value={reason}
                  onChangeText={setReason}
                />
                <View className="mt-5 rounded-2xl p-4" style={{ backgroundColor: isFoster ? COLORS.peachBg : COLORS.mintBg }}>
                  <Text className="font-bold" style={{ color: accentColor }}>
                    {isFoster
                      ? "I understand fostering is a temporary commitment and I will follow shelter guidelines."
                      : "I understand adoption may require a home visit and follow-up checks."}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom nav buttons */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t px-6 py-4"
          style={{ borderColor, paddingBottom: Platform.OS === "ios" ? 28 : 70}}
        >
          <TouchableOpacity
            className="w-full rounded-2xl py-4 items-center"
            style={{ backgroundColor: accentColor }}
            onPress={next}
            disabled={loading}
          > 
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold">
                {step === 3
                  ? isFoster ? "Submit Foster Application" : "Submit Application"
                  : "Continue"}
              </Text>
            )}
          </TouchableOpacity>
          {step > 1 && (
            <TouchableOpacity className="mt-3 items-center" onPress={() => setStep((v) => v - 1)}>
              <Text className="font-extrabold" style={{ color: accentColor }}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
