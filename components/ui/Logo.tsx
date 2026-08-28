import React from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({
  width = 40,
  height = 40,
  className = "",
}: Props) {
  return (
    <View className={className} style={{ width, height }}>
      <Svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
        <Defs>
          {/* گرادیانت لوگو */}
          <LinearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5b8def" />
            <Stop offset="100%" stopColor="#1877f2" />
          </LinearGradient>
        </Defs>

        {/* بخش بالایی کلاه */}
        <Path d="M50 15L85 32.5L50 50L15 32.5L50 15Z" fill="url(#logo-grad)" />

        {/* بدنه و پایه کلاه */}
        <Path
          d="M25 43.5V65C25 75 35 83 50 83C65 83 75 75 75 65V43.5L50 56L25 43.5Z"
          fill="url(#logo-grad)"
          opacity="0.85"
        />

        {/* سایه‌روشن داخلی (بخش سفید کمرنگ) */}
        <Path d="M50 56L80 41V68L50 83V56Z" fill="#ffffff" opacity="0.15" />
      </Svg>
    </View>
  );
}
