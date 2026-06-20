import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ]),
      );

    const animations = [bounce(dot1, 0), bounce(dot2, 200), bounce(dot3, 400)];
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [dot1, dot2, dot3]);

  return (
    <View className="mb-4 flex-row items-end">
      <View className="mb-1 mr-2 h-8 w-8 items-center justify-center rounded-full bg-emerald-700">
        <Ionicons name="paw" size={16} color="white" />
      </View>
      <View className="flex-row items-center gap-1 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={{ transform: [{ translateY: dot }] }} className="mx-0.5 h-2 w-2 rounded-full bg-gray-400" />
        ))}
      </View>
    </View>
  );
}
