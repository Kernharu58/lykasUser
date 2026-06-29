import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Linking,
  Platform, ScrollView, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../utils/api";

const amounts = [500, 1000, 2500, 5000];

// FIX (Critical #1): Method keys must match PayMongo accepted values
const methods = [
  { key: "gcash",     label: "GCash" },
  { key: "card",      label: "Credit / Debit" },
  { key: "paymaya",   label: "Maya" },
  { key: "grab_pay",  label: "GrabPay" },
];

// FIX (Warning #3): Payment success screen shown after redirect back
function PaymentSuccessScreen({ amount, onDone }: { amount: number; onDone: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900 items-center justify-center px-6">
      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-[#EAF4EE] items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={56} color="#1E6B45" />
        </View>
        <Text className="text-3xl font-extrabold text-[#111827] dark:text-white mb-2">Thank you!</Text>
        <Text className="text-center text-[#6B7280] dark:text-gray-400 text-base mb-1">
          Your donation of
        </Text>
        <Text className="text-2xl font-extrabold text-[#1E6B45] mb-4">
          ₱{amount.toLocaleString()}
        </Text>
        <Text className="text-center text-[#6B7280] dark:text-gray-400 text-base mb-8">
          has been received. Every peso helps us care for animals waiting for their forever home. 🐾
        </Text>
        <TouchableOpacity
          className="w-full rounded-2xl bg-[#1E6B45] py-4"
          onPress={onDone}
        >
          <Text className="text-center font-extrabold text-white text-base">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function Donate() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("gcash");
  const [loading, setLoading] = useState(false);
  // FIX (Warning #3): Track payment success state
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);

  const finalAmount = selectedAmount === "custom" ? Number(customAmount) : selectedAmount;

  // FIX (Warning #3): Handle payment success screen done
  if (paymentSuccess) {
    return (
      <PaymentSuccessScreen
        amount={confirmedAmount}
        onDone={() => router.replace("/(tabs)")}
      />
    );
  }

  const handleDonate = async () => {
    if (!finalAmount || finalAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid donation amount.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/payments/create-checkout", {
        type: "donation",
        amount: finalAmount,
        description: `Donation to CarePaws Shelter — ₱${finalAmount}`,
        // FIX (Critical #1): Pass the selected payment method to the backend
        paymentMethod: selectedMethod,
        successUrl: "carepaws://payment/success",
        cancelUrl:  "carepaws://payment/cancel",
      });
      const { checkoutUrl } = res.data;
      if (checkoutUrl) {
        // FIX (Warning #3): Listen for the deep-link callback and show success screen
        const handleUrl = ({ url }: { url: string }) => {
          if (url?.includes("payment/success")) {
            setConfirmedAmount(finalAmount);
            setPaymentSuccess(true);
          }
        };
        const sub = Linking.addEventListener("url", handleUrl);
        await Linking.openURL(checkoutUrl);
        // Clean up listener after a reasonable window (PayMongo checkout takes ≤10 min)
        setTimeout(() => sub.remove(), 600_000);
      }
    } catch (err: any) {
      Alert.alert("Payment Error", err.response?.data?.message || "Could not initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#111827] dark:text-white">Donate</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}>
          <View className="rounded-3xl bg-[#1E6B45] p-5 mb-6">
            <Text className="text-2xl font-extrabold text-white">Support CarePaws 🐾</Text>
            <Text className="mt-2 text-white/80">Your donation helps us feed, shelter, and care for animals waiting for their forever home.</Text>
          </View>

          <Text className="mb-3 font-extrabold text-[#111827] dark:text-white">Choose an amount</Text>
          <View className="mb-5 flex-row flex-wrap gap-3">
            {amounts.map(a => (
              <TouchableOpacity key={a} className={`rounded-2xl px-5 py-3 ${selectedAmount === a ? "bg-[#1E6B45]" : "bg-white border border-[#DCE8E1] dark:bg-gray-800"}`}
                onPress={() => { setSelectedAmount(a); setCustomAmount(""); }}>
                <Text className={`font-extrabold ${selectedAmount === a ? "text-white" : "text-[#111827] dark:text-white"}`}>₱{a.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity className={`rounded-2xl px-5 py-3 ${selectedAmount === "custom" ? "bg-[#1E6B45]" : "bg-white border border-[#DCE8E1] dark:bg-gray-800"}`}
              onPress={() => setSelectedAmount("custom")}>
              <Text className={`font-extrabold ${selectedAmount === "custom" ? "text-white" : "text-[#111827] dark:text-white"}`}>Custom</Text>
            </TouchableOpacity>
          </View>

          {selectedAmount === "custom" && (
            <TextInput value={customAmount} onChangeText={setCustomAmount} keyboardType="numeric"
              placeholder="Enter amount (PHP)" placeholderTextColor="#9CA3AF"
              className="mb-5 rounded-2xl border border-[#DCE8E1] bg-white px-4 py-4 text-[#111827] dark:bg-gray-800 dark:text-white" />
          )}

          <Text className="mb-3 font-extrabold text-[#111827] dark:text-white">Payment method</Text>
          <View className="mb-6 gap-3">
            {methods.map(m => (
              <TouchableOpacity key={m.key} className={`flex-row items-center rounded-2xl border p-4 ${selectedMethod === m.key ? "border-[#1E6B45] bg-[#EAF4EE]" : "border-[#DCE8E1] bg-white dark:bg-gray-800"}`}
                onPress={() => setSelectedMethod(m.key)}>
                <View className={`h-5 w-5 rounded-full border-2 items-center justify-center mr-3 ${selectedMethod === m.key ? "border-[#1E6B45]" : "border-[#DCE8E1]"}`}>
                  {selectedMethod === m.key && <View className="h-2.5 w-2.5 rounded-full bg-[#1E6B45]" />}
                </View>
                <Text className={`font-bold ${selectedMethod === m.key ? "text-[#1E6B45]" : "text-[#111827] dark:text-white"}`}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-4 rounded-2xl bg-[#F4F2EE] p-4">
            <View className="flex-row justify-between mb-1">
              <Text className="font-bold text-[#6B7280]">Donation amount</Text>
              <Text className="font-extrabold text-[#111827] dark:text-white">₱{finalAmount > 0 ? finalAmount.toLocaleString() : "—"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-bold text-[#6B7280]">Payment method</Text>
              <Text className="font-bold text-[#111827] dark:text-white">{methods.find(m => m.key === selectedMethod)?.label}</Text>
            </View>
          </View>

          <TouchableOpacity className="rounded-2xl bg-[#1E6B45] py-4" onPress={handleDonate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-center font-extrabold text-white">Donate ₱{finalAmount > 0 ? finalAmount.toLocaleString() : "—"}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
