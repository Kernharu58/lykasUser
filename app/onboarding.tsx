import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const slides = [
  { title: "Welcome to CarePaws", body: "Find adoptable pets, understand every step, and stay connected with shelter staff.", icon: "paw" },
  { title: "Foster before forever", body: "Mandatory foster trials help confirm health, fit, and home readiness before final adoption.", icon: "home" },
  { title: "Track care records", body: "Baby books, health reminders, reports, and documents keep post-adoption welfare visible.", icon: "medkit" },
  { title: "Our mission", body: "CarePaws connects rescued animals with responsible families through transparent, humane adoption.", icon: "heart" },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9] dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <TouchableOpacity className="self-end rounded-full px-4 py-2" onPress={() => router.replace("/(auth)/logIn")}>
          <Text className="font-extrabold text-[#1E6B45]">Skip</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <View className="h-28 w-28 items-center justify-center rounded-full bg-[#EAF4EE]">
            <Ionicons name={slide.icon as any} size={56} color="#1E6B45" />
          </View>
          <Text className="mt-8 text-center text-4xl font-extrabold text-[#111827] dark:text-white">{slide.title}</Text>
          <Text className="mt-4 text-center text-base leading-7 text-[#6B7280] dark:text-gray-300">{slide.body}</Text>

          <View className="mt-8 flex-row gap-2">
            {slides.map((item, dotIndex) => (
              <View key={item.title} className={`h-2 rounded-full ${dotIndex === index ? "w-8 bg-[#1E6B45]" : "w-2 bg-[#DCE8E1]"}`} />
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="rounded-2xl bg-[#1E6B45] py-4"
          onPress={() => (isLast ? router.replace("/(auth)/signUp") : setIndex(index + 1))}
        >
          <Text className="text-center text-lg font-extrabold text-white">{isLast ? "Get Started" : "Next"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3 py-3" onPress={() => router.replace("/(auth)/logIn")}>
          <Text className="text-center font-bold text-[#6B7280]">I already have an account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
