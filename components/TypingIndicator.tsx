import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

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
        ])
      );
    bounce(dot1, 0).start();
    bounce(dot2, 200).start();
    bounce(dot3, 400).start();
  }, []);

  return (
    <View className="flex-row items-end mb-4">
      <View className="w-8 h-8 rounded-full bg-emerald-700 items-center justify-center mr-2 mb-1">
        <Text style={{ fontSize: 14 }}>🐾</Text>
      </View>
      <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm gap-1">
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{ transform: [{ translateY: dot }] }}
            className="w-2 h-2 rounded-full bg-gray-400 mx-0.5"
          />
        ))}
      </View>
    </View>
  );
}