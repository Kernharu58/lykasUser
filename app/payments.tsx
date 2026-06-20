import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../components/StateView";
import api from "../utils/api";

const statusColor: Record<string, string> = { paid: "#1E6B45", pending: "#E8A020", failed: "#EF4444", refunded: "#6B7280" };
const statusBg: Record<string, string>    = { paid: "#EAF4EE", pending: "#FEF3E2", failed: "#FEE2E2", refunded: "#F4F2EE" };

export default function Payments() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [pendingFee, setPendingFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setError(null);
      const res = await api.get("/payments/my");
      const all: any[] = res.data.payments || [];
      setPayments(all);
      const fee = all.find(p => p.type === "adoption_fee" && p.status === "pending");
      setPendingFee(fee || null);
    } catch (e) {
      console.error(e);
      setError("Could not load payments and receipts.");
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchPayments(); }, []));

  const handlePayFee = async () => {
    if (pendingFee?.paymongoCheckoutUrl) {
      await Linking.openURL(pendingFee.paymongoCheckoutUrl);
      return;
    }
    setPaying(true);
    try {
      const res = await api.post("/payments/create-checkout", {
        type: "adoption_fee",
        amount: 3000,
        description: "Adoption Fee — CarePaws Shelter",
        successUrl: "carepaws://payment/success",
        cancelUrl:  "carepaws://payment/cancel",
      });
      await Linking.openURL(res.data.checkoutUrl);
      fetchPayments();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Payment Error", e.response?.data?.message || "Could not start checkout. Please try again.");
    } finally { setPaying(false); }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] px-6">
      <LoadingState message="Loading payments..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCE8E1] dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color="#1E6B45" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-[#111827] dark:text-white">Payments</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} colors={["#1E6B45"]} />}
      >
        {error ? (
          <ErrorState message={error} onAction={fetchPayments} />
        ) : null}

        {/* Adoption Fee Card */}
        {!error && <View className="rounded-3xl border border-[#DCE8E1] bg-white p-5 dark:bg-gray-800 mb-5">
          <Text className="text-xl font-extrabold text-[#111827] dark:text-white">Adoption Fee</Text>
          {[["Medical and vaccines", "PHP 1,500"], ["Microchip", "PHP 800"], ["Shelter care fee", "PHP 700"]].map(([label, value]) => (
            <View key={label} className="mt-4 flex-row justify-between">
              <Text className="font-bold text-[#6B7280]">{label}</Text>
              <Text className="font-extrabold text-[#111827] dark:text-white">{value}</Text>
            </View>
          ))}
          <View className="mt-5 border-t border-[#DCE8E1] pt-4 flex-row justify-between">
            <Text className="text-lg font-extrabold text-[#111827] dark:text-white">Total</Text>
            <Text className="text-lg font-extrabold text-[#1E6B45]">PHP 3,000</Text>
          </View>
          <TouchableOpacity className="mt-4 rounded-2xl bg-[#1E6B45] py-4" onPress={handlePayFee} disabled={paying}>
            {paying ? <ActivityIndicator color="#fff" />
              : <Text className="text-center font-extrabold text-white">Pay Now with PayMongo</Text>}
          </TouchableOpacity>
        </View>}

        {/* Payment History */}
        <Text className="mb-3 text-xl font-extrabold text-[#111827] dark:text-white">Payment History</Text>
        {!error && payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            message="Adoption fees, donation receipts, and payment statuses will appear here."
            icon="receipt-outline"
          />
        ) : (
          <View className="gap-3">
            {payments.map(p => (
              <View key={p._id} className="rounded-3xl border border-[#DCE8E1] bg-white p-4 dark:bg-gray-800">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="font-extrabold text-[#111827] dark:text-white capitalize">{p.type.replace("_", " ")}</Text>
                    <Text className="text-sm text-[#6B7280] mt-1">{p.description || "—"}</Text>
                    <Text className="text-xs text-[#B0A898] mt-1">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-extrabold text-[#1E6B45]">₱{((p.amount || 0) / 100).toLocaleString()}</Text>
                    <View className="mt-1 rounded-full px-2 py-0.5" style={{ backgroundColor: statusBg[p.status] }}>
                      <Text className="text-xs font-bold capitalize text-center" style={{ color: statusColor[p.status] }}>{p.status}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity className="mt-6 rounded-2xl border border-[#1E6B45] py-4" onPress={() => router.push("/donate" as any)}>
          <Text className="text-center font-extrabold text-[#1E6B45]">Make a Donation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
