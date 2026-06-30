import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../components/StateView";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate } from "../utils/format";
import api from "../utils/api";
import { COLORS } from "../utils/colors";

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
    <SafeAreaView className="flex-1 bg-bgSoft px-6">
      <LoadingState message="Loading payments..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900">
      <View className="flex-row items-center px-6 mt-4 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-border dark:bg-gray-800">
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-extrabold text-ink dark:text-white">Payments</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} colors={[COLORS.primary]} />}
      >
        {error ? (
          <ErrorState message={error} onAction={fetchPayments} />
        ) : null}

        {/* Adoption Fee Card */}
        {!error && <View className="rounded-3xl border border-border bg-white p-5 dark:bg-gray-800 mb-5">
          <Text className="text-xl font-extrabold text-ink dark:text-white">Adoption Fee</Text>
          {[["Medical and vaccines", "PHP 1,500"], ["Microchip", "PHP 800"], ["Shelter care fee", "PHP 700"]].map(([label, value]) => (
            <View key={label} className="mt-4 flex-row justify-between">
              <Text className="font-bold text-muted">{label}</Text>
              <Text className="font-extrabold text-ink dark:text-white">{value}</Text>
            </View>
          ))}
          <View className="mt-5 border-t border-border pt-4 flex-row justify-between">
            <Text className="text-lg font-extrabold text-ink dark:text-white">Total</Text>
            <Text className="text-lg font-extrabold text-primary">PHP 3,000</Text>
          </View>
          <TouchableOpacity className="mt-4 rounded-2xl bg-primary py-4" onPress={handlePayFee} disabled={paying}>
            {paying ? <ActivityIndicator color="#fff" />
              : <Text className="text-center font-extrabold text-white">Pay Now with PayMongo</Text>}
          </TouchableOpacity>
        </View>}

        {/* Payment History */}
        <Text className="mb-3 text-xl font-extrabold text-ink dark:text-white">Payment History</Text>
        {!error && payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            message="Adoption fees, donation receipts, and payment statuses will appear here."
            icon="receipt-outline"
          />
        ) : (
          <View className="gap-3">
            {payments.map(p => (
              <View key={p._id} className="rounded-3xl border border-border bg-white p-4 dark:bg-gray-800">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="font-extrabold text-ink dark:text-white capitalize">{p.type.replace("_", " ")}</Text>
                    <Text className="text-sm text-muted mt-1">{p.description || "—"}</Text>
                    <Text className="text-xs text-sand mt-1">
                      {formatDate(p.paidAt || p.createdAt)}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-extrabold text-primary">₱{((p.amount || 0) / 100).toLocaleString()}</Text>
                    <StatusBadge status={p.status} domain="payment" className="mt-1" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity className="mt-6 rounded-2xl border border-primary py-4" onPress={() => router.push("/donate" as any)}>
          <Text className="text-center font-extrabold text-primary">Make a Donation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
