// FIX (Warning #3): Payment cancel deep-link screen
// Opened when user cancels from PayMongo checkout
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../utils/colors";

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bgSoft dark:bg-gray-900 items-center justify-center px-6">
      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-rose-50 items-center justify-center mb-6">
          <Ionicons name="close-circle" size={56} color={COLORS.rose} />
        </View>
        <Text className="text-3xl font-extrabold text-ink dark:text-white mb-3">Payment cancelled</Text>
        <Text className="text-center text-muted dark:text-gray-400 text-base mb-8">
          No worries — your payment was not processed. You can try again anytime.
        </Text>
        <TouchableOpacity
          className="w-full rounded-2xl bg-primary py-4 mb-3"
          onPress={() => router.back()}
        >
          <Text className="text-center font-extrabold text-white text-base">Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full rounded-2xl bg-slate-100 py-4"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-center font-bold text-slate-600 text-base">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
