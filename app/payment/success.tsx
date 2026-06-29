// FIX (Warning #3): Payment success deep-link screen
// This screen is opened when PayMongo redirects back to carepaws://payment/success
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900 items-center justify-center px-6">
      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-[#EAF4EE] items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={56} color="#1E6B45" />
        </View>
        <Text className="text-3xl font-extrabold text-[#111827] dark:text-white mb-3">Payment received!</Text>
        <Text className="text-center text-[#6B7280] dark:text-gray-400 text-base mb-8">
          Thank you for your support. Your contribution helps us care for animals waiting for their forever home. 🐾
        </Text>
        <TouchableOpacity
          className="w-full rounded-2xl bg-[#1E6B45] py-4 mb-3"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-center font-extrabold text-white text-base">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
