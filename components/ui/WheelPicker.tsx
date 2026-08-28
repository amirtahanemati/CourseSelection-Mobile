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

const ITEM_HEIGHT = 44;

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
      }, 50);
    }
  }, [selectedValue, items]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (items[index] && items[index] !== selectedValue) {
      onValueChange(items[index]);
    }
  };

  return (
    <View className="flex-1 h-[220px] relative justify-center">
      <View
        className={`absolute top-[88px] left-2 right-2 h-[44px] rounded-xl border ${isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"} pointer-events-none z-0`}
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        className="z-10"
      >
        <View style={{ height: 88 }} />
        {items.map((item) => (
          <View
            key={item}
            style={{ height: ITEM_HEIGHT }}
            className="justify-center items-center"
          >
            <Text
              className={`font-mono text-xl ${item === selectedValue ? "font-extrabold text-blue-500 scale-110" : isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {item}
            </Text>
          </View>
        ))}
        <View style={{ height: 88 }} />
      </ScrollView>
    </View>
  );
}
