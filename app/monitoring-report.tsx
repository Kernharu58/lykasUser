import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

const conditionOptions = ["Excellent", "Good", "Fair", "Poor"];

export default function MonitoringReport() {
  const router = useRouter();
  const [activeFoster, setActiveFoster] = useState<any>(null);
  const [myPets, setMyPets] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [petId, setPetId] = useState("");
  const [reportMonth, setReportMonth] = useState("1");
  const [currentWeight, setCurrentWeight] = useState("");
  const [overallCondition, setOverallCondition] = useState("Good");
  const [behaviorAtHome, setBehaviorAtHome] = useState("");
  const [diet, setDiet] = useState("");
  const [issuesOrConcerns, setIssuesOrConcerns] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [fosterRes, petsRes] = await Promise.allSettled([
          api.get("/foster/my"),
          api.get("/pets?owned=true"),
        ]);
        if (fosterRes.status === "fulfilled") {
          const active = fosterRes.value.data.find((f: any) => f.status === "active");
          setActiveFoster(active || null);
          if (active?.pet?._id) setPetId(active.pet._id);
        }
        if (petsRes.status === "fulfilled") setMyPets(petsRes.value.data?.pets || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!petId) { Alert.alert("Error", "No pet selected."); return; }
    if (!currentWeight) { Alert.alert("Error", "Please enter current weight."); return; }
    setSubmitting(true);
    try {
      await api.post("/monitoring-reports", {
        petId,
        reportMonth: Number(reportMonth),
        currentWeight,
        overallCondition,
        behaviorAtHome,
        diet,
        issuesOrConcerns,
        comments,
      });
      Alert.alert("Submitted!", "Your monitoring report has been sent to staff.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not submit report.");
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#111827] dark:text-white">Monitoring Report</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
        {activeFoster && (
          <View className="mb-5 rounded-2xl bg-[#EAF4EE] p-4">
            <Text className="font-bold text-[#1E6B45]">Submitting for: {activeFoster.pet?.name}</Text>
          </View>
        )}

        {/* BUG FIX: previously, if the adopter had no active foster trial,
            `petId` was never populated and there was no way to pick a pet —
            the fetched `myPets` list was loaded but never rendered, so the
            form was a dead end for long-term post-adoption monitoring
            reports. Show a picker built from the owned pets in that case. */}
        {!activeFoster && (
          <View className="mb-5">
            <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Select Pet</Text>
            {myPets.length === 0 ? (
              <Text className="text-[#6B7280]">No adopted or fostered pets found on your account.</Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {myPets.map((pet: any) => (
                  <TouchableOpacity key={pet._id}
                    className={`rounded-2xl px-4 py-3 ${petId === pet._id ? "bg-[#1E6B45]" : "bg-white border border-[#DCE8E1] dark:bg-gray-800"}`}
                    onPress={() => setPetId(pet._id)}>
                    <Text className={`font-extrabold ${petId === pet._id ? "text-white" : "text-[#6B7280]"}`}>{pet.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Report Month #</Text>
        <TextInput keyboardType="numeric" value={reportMonth} onChangeText={setReportMonth}
          placeholder="e.g. 1" placeholderTextColor="#9CA3AF"
          className="mb-5 rounded-2xl border border-[#DCE8E1] bg-white px-4 py-4 text-[#111827] dark:bg-gray-800 dark:border-gray-700 dark:text-white" />

        <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Current Weight</Text>
        <TextInput value={currentWeight} onChangeText={setCurrentWeight}
          placeholder="e.g. 4.2 kg" placeholderTextColor="#9CA3AF"
          className="mb-5 rounded-2xl border border-[#DCE8E1] bg-white px-4 py-4 text-[#111827] dark:bg-gray-800 dark:border-gray-700 dark:text-white" />

        <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Overall Condition</Text>
        <View className="mb-5 flex-row flex-wrap gap-2">
          {conditionOptions.map(item => (
            <TouchableOpacity key={item}
              className={`rounded-2xl px-4 py-3 ${overallCondition === item ? "bg-[#1E6B45]" : "bg-white border border-[#DCE8E1] dark:bg-gray-800"}`}
              onPress={() => setOverallCondition(item)}>
              <Text className={`font-extrabold ${overallCondition === item ? "text-white" : "text-[#6B7280]"}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Diet / Eating Habits</Text>
        <TextInput value={diet} onChangeText={setDiet} multiline
          placeholder="Describe food, amount, frequency..." placeholderTextColor="#9CA3AF"
          className="mb-5 min-h-[80px] rounded-2xl border border-[#DCE8E1] bg-white px-4 py-4 text-[#111827] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          textAlignVertical="top" />

        <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Behavior at Home</Text>
        <TextInput value={behaviorAtHome} onChangeText={setBehaviorAtHome} multiline
          placeholder="How is the pet adjusting?" placeholderTextColor="#9CA3AF"
          className="mb-5 min-h-[80px] rounded-2xl border border-[#DCE8E1] bg-white px-4 py-4 text-[#111827] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          textAlignVertical="top" />

        <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Issues or Concerns</Text>
        <TextInput value={issuesOrConcerns} onChangeText={setIssuesOrConcerns} multiline
          placeholder="Any health or behavioral concerns..." placeholderTextColor="#9CA3AF"
          className="mb-5 min-h-[80px] rounded-2xl border border-[#DCE8E1] bg-white px-4 py-4 text-[#111827] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          textAlignVertical="top" />

        <Text className="mb-2 font-extrabold text-[#111827] dark:text-white">Additional Comments</Text>
        <TextInput value={comments} onChangeText={setComments} multiline
          placeholder="Anything else you'd like to share..." placeholderTextColor="#9CA3AF"
          className="mb-6 min-h-[80px] rounded-2xl border border-[#DCE8E1] bg-white px-4 py-4 text-[#111827] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          textAlignVertical="top" />

        <TouchableOpacity className="rounded-2xl bg-[#1E6B45] py-4" onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-center font-extrabold text-white">Submit Report</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}