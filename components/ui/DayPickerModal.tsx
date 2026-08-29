import { Check, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";
import WheelPicker from "./WheelPicker";

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  initialDay: string;
  onConfirm: (day: string) => void;
  onClose: () => void;
}

export default function DayPickerModal({
  visible,
  initialDay,
  onConfirm,
  onClose,
}: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";
  const [day, setDay] = useState(DAYS[0]);

  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 5 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.8) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 25,
            stiffness: 250,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setDay(initialDay);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 25,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleCloseAnimation();
    }
  }, [visible, initialDay]);

  const handleCloseAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsVisible(false));
  };

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(day);
    onClose();
  };

  if (!isVisible && !visible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: isDark ? 0.6 : 0.15,
            shadowRadius: 20,
            elevation: 30,
          }}
          className={`rounded-t-[32px] p-6 pb-10 w-full border-t ${isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-transparent"}`}
        >
          <View
            {...panResponder.panHandlers}
            style={{
              backgroundColor: "transparent",
              width: "100%",
              alignItems: "center",
            }}
            className="pb-6"
          >
            <View
              className="w-16 h-1.5 rounded-full mb-6 mt-1"
              style={{ backgroundColor: isDark ? "#2a2d35" : "#e5e7eb" }}
            />

            <Text
              className={`text-xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
              style={{ writingDirection: "rtl", letterSpacing: 0 }}
            >
              انتخاب روز کلاس
            </Text>
          </View>

          <View
            className={`rounded-[28px] border p-4 mb-8 ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50/50 border-gray-200"}`}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                paddingTop: 14,
                paddingBottom: 8,
              }}
            >
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  className={`text-xs font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  روزهای هفته
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 162,
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <View style={{ flex: 1, height: 162 }}>
                <WheelPicker
                  items={DAYS}
                  selectedValue={day}
                  onValueChange={setDay}
                />
              </View>
            </View>
          </View>

          <View className="flex-row-reverse gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClose}
              className={`flex-1 py-3.5 rounded-2xl flex-row-reverse items-center justify-center gap-2 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
            >
              <X size={18} color={isDark ? "#d1d5db" : "#4b5563"} />
              <Text
                className={`font-bold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                انصراف
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              className="flex-1 bg-blue-500 py-3.5 rounded-2xl flex-row-reverse items-center justify-center gap-2 shadow-sm"
            >
              <Check size={18} color="white" />
              <Text className="text-white font-bold text-sm">تأیید روز</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
