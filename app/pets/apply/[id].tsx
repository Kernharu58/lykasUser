import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../utils/api";

const GREEN = "#1E6B45";

export default function AdoptionApplication() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [housing, setHousing] = useState("House");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = useMemo(() => (step / 3) * 100, [step]);
  const canContinue = step === 1 ? phone.trim() && address.trim() : step === 2 ? housing && experience.trim() : reason.trim();

  const handleSubmit = async () => {
    if (!phone || !address || !experience || !reason) {
      Alert.alert("Required", "Please complete all sections before submitting.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/pets/${id}/adopt`, { phone, address, experience: `${housing}. ${experience}. Reason: ${reason}` });
      Alert.alert("Application submitted", "We'll review your application and update you in My Apps.", [
        { text: "Track My Application", onPress: () => router.replace("/(tabs)/my-applications") },
      ]);
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
    if (step < 3) setStep((value) => value + 1);
    else handleSubmit();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-row items-center px-6 mt-4 mb-5">
          <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1]">
            <Ionicons name="arrow-back" size={20} color={GREEN} />
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">Application</Text>
            <Text className="text-xs font-bold text-gray-500">Step {step} of 3</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}><Text className="font-bold text-[#1E6B45]">Cancel</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
          <View className="mb-6 h-3 rounded-full bg-[#DCE8E1] overflow-hidden">
            <View className="h-3 rounded-full bg-[#1E6B45]" style={{ width: `${progress}%` }} />
          </View>

          <View className="rounded-3xl bg-white border border-[#DCE8E1] p-5 shadow-sm">
            {step === 1 && (
              <View>
                <Text className="text-2xl font-extrabold text-gray-900">Personal details</Text>
                <Text className="mt-2 text-gray-500 leading-5">Staff will use this to coordinate screening and home visit scheduling.</Text>
                <Text className="mt-6 mb-2 font-extrabold text-gray-900">Phone Number</Text>
                <TextInput className="rounded-2xl border border-[#DCE8E1] bg-[#F8FAF9] px-4 py-4 text-gray-900" placeholder="+63 912 345 6789" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                <Text className="mt-5 mb-2 font-extrabold text-gray-900">Home Address / City</Text>
                <TextInput className="rounded-2xl border border-[#DCE8E1] bg-[#F8FAF9] px-4 py-4 text-gray-900" placeholder="Angeles City, Pampanga" placeholderTextColor="#9CA3AF" value={address} onChangeText={setAddress} />
              </View>
            )}

            {step === 2 && (
              <View>
                <Text className="text-2xl font-extrabold text-gray-900">Living situation</Text>
                <Text className="mt-2 text-gray-500 leading-5">Help us understand if this pet fits your home and routine.</Text>
                <Text className="mt-6 mb-3 font-extrabold text-gray-900">Housing type</Text>
                <View className="flex-row gap-2">
                  {["House", "Apartment", "Condo"].map((item) => (
                    <TouchableOpacity key={item} onPress={() => setHousing(item)} className={`flex-1 rounded-2xl py-3 ${housing === item ? "bg-[#1E6B45]" : "bg-[#F8FAF9] border border-[#DCE8E1]"}`}>
                      <Text className={`text-center font-bold ${housing === item ? "text-white" : "text-gray-600"}`}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="mt-5 mb-2 font-extrabold text-gray-900">Experience & household</Text>
                <TextInput className="min-h-[120px] rounded-2xl border border-[#DCE8E1] bg-[#F8FAF9] px-4 py-4 text-gray-900" placeholder="Tell us about your schedule, other pets, children, and pet care experience." placeholderTextColor="#9CA3AF" multiline textAlignVertical="top" value={experience} onChangeText={setExperience} />
              </View>
            )}

            {step === 3 && (
              <View>
                <Text className="text-2xl font-extrabold text-gray-900">Review commitment</Text>
                <Text className="mt-2 text-gray-500 leading-5">One last note helps staff make a careful adoption decision.</Text>
                <Text className="mt-6 mb-2 font-extrabold text-gray-900">Why this pet?</Text>
                <TextInput className="min-h-[130px] rounded-2xl border border-[#DCE8E1] bg-[#F8FAF9] px-4 py-4 text-gray-900" placeholder="Share why this pet feels like the right match." placeholderTextColor="#9CA3AF" multiline textAlignVertical="top" value={reason} onChangeText={setReason} />
                <View className="mt-5 rounded-2xl bg-[#EAF4EE] p-4">
                  <Text className="font-bold text-[#1E6B45]">I understand adoption may require home visit and follow-up checks.</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#DCE8E1] px-6 py-4" style={{ paddingBottom: Platform.OS === "ios" ? 28 : 16 }}>
          <View className="flex-row gap-3">
            {step > 1 && (
              <TouchableOpacity className="flex-1 rounded-2xl border border-[#1E6B45] py-4" onPress={() => setStep((value) => value - 1)}>
                <Text className="text-center font-extrabold text-[#1E6B45]">Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity className={`${step > 1 ? "flex-1" : "w-full"} rounded-2xl bg-[#1E6B45] py-4 items-center`} onPress={next} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-extrabold">{step === 3 ? "Submit Application" : "Continue"}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
