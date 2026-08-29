import React, { useEffect, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";

interface Props {
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const ITEM_HEIGHT = 54;

export default function WheelPicker({
  items,
  selectedValue,
  onValueChange,
}: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = items.indexOf(selectedValue);
    if (index >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [selectedValue, items]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (items[index] && items[index] !== selectedValue) {
      onValueChange(items[index]);
    }
  };

  return (
    <View style={{ height: ITEM_HEIGHT * 3, width: "100%" }}>
      {/* 
          👇 باکس آبی با تغییر به -6 کمی بالاتر رفت 
          تا خطای بصری (Visual Offset) فونت فارسی را جبران کند 
      */}
      <View
        style={{
          position: "absolute",
          top: ITEM_HEIGHT - 6,
          left: 8,
          right: 8,
          height: ITEM_HEIGHT,
          borderRadius: 16,
          backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
          zIndex: 0,
        }}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        style={{ height: ITEM_HEIGHT * 3, width: "100%", zIndex: 10 }}
      >
        <View style={{ height: ITEM_HEIGHT, width: "100%" }} />
        {items.map((item) => {
          const isSelected = item === selectedValue;
          return (
            <View
              key={item}
              style={{
                height: ITEM_HEIGHT,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                className={`font-mono text-2xl ${
                  isSelected
                    ? "font-extrabold text-blue-500"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
                style={{
                  textAlign: "center",
                  textAlignVertical: "center",
                  includeFontPadding: false,
                }}
              >
                {item}
              </Text>
            </View>
          );
        })}
        <View style={{ height: ITEM_HEIGHT, width: "100%" }} />
      </ScrollView>
    </View>
  );
}
