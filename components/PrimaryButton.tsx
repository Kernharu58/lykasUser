import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

// Extending TouchableOpacityProps allows us to pass standard props like onPress, disabled, etc.
interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "solid" | "outline";
}

export default function PrimaryButton({
  title,
  variant = "solid",
  className,
  ...rest
}: PrimaryButtonProps) {
  const isSolid = variant === "solid";

  return (
    <TouchableOpacity
      className={`py-4 rounded-xl items-center shadow-sm flex-row justify-center ${
        isSolid ? "bg-primary" : "bg-transparent border-2 border-primary"
      } ${className}`}
      {...rest}
    >
      <Text
        className={`font-bold text-base ${isSolid ? "text-white" : "text-primary"}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
