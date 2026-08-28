import React from "react";
import { TextInput as RNTextInput, TextInputProps } from "react-native";

export default function CustomTextInput({ style, ...props }: TextInputProps) {
  return (
    <RNTextInput
      {...props}
      style={[{ fontFamily: "DanaFaNum", textAlign: "right" }, style]}
    />
  );
}
