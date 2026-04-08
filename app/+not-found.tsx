import { Link, Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-5">
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Text className="text-xl font-bold mb-4 text-darkBlue">This screen doesn&apos;t exist.</Text>
      <Link href="/(tabs)" className="text-primary mt-4 py-4 font-bold">
        Go to home screen!
      </Link>
    </View>
  );
}