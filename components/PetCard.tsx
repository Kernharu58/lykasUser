import { Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PetCardProps {
  id: string;
  name: string;
  breed: string;
  image: string;
}

export default function PetCard({ id, name, breed, image }: PetCardProps) {
  return (
    // We use a strict inline style for width to guarantee a perfect 2-column grid
    <View
      style={{ width: "48%" }}
      className="bg-white rounded-3xl p-3 mb-5 shadow-sm border border-gray-100 flex-col dark:bg-gray-800 dark:border-gray-700 dark:text-white "
    >
      {/* --- Image --- */}
      <Image
        source={{ uri: image }}
        className="w-full rounded-2xl mb-3 bg-gray-100 "
        style={{ height: 150 }}
        resizeMode="cover"
      />

      {/* --- Text Info --- */}
      {/* flex-1 ensures the text takes up available space, pushing the button to the bottom */}
      <View className="flex-1 mb-3 px-1  ">
        <Text
          className="text-darkBlue font-extrabold text-lg"
          numberOfLines={1} // Prevents long names from breaking the layout
        >
          {name}
        </Text>
        <Text
          className="text-warnBrown font-semibold text-xs mt-0.5"
          numberOfLines={1} // Truncates long breeds like "Golden Retriever" smoothly
        >
          {breed}
        </Text>
      </View>

      {/* --- Action Button --- */}
      <Link href={`/pets/${id}`} asChild>
        <TouchableOpacity className="bg-primary py-3 rounded-xl items-center w-full shadow-sm">
          <Text className="text-white font-bold text-sm">Meet {name}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
