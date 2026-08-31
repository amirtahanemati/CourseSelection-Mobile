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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";
import WheelPicker from "./WheelPicker";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = ["00", "15", "30", "45"];

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  initialTime: string;
  onConfirm: (time: string) => void;
  onClose: () => void;
}

export default function TimePickerModal({
  visible,
  initialTime,
  onConfirm,
  onClose,
}: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";
  const insets = useSafeAreaInsets();
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");

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
      if (initialTime.includes(":")) {
        const [h, m] = initialTime.split(":");
        setHour(h.padStart(2, "0"));
        setMinute(MINUTES.includes(m) ? m : "00");
      }
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
  }, [visible, initialTime]);

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
    onConfirm(`${hour}:${minute}`);
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
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          className={`rounded-t-[32px] p-6 w-full border-t ${isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-transparent"}`}
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
              انتخاب ساعت
            </Text>
          </View>

          <View
            className={`rounded-[28px] border p-4 mb-8 ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50/50 border-gray-200"}`}
          >
            {/* 👇 اضافه شدن paddingTop برای فاصله گرفتن از سقف و کاهش paddingBottom */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                paddingTop: 2,
                paddingBottom: 8,
              }}
            >
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  className={`text-xs font-bold pt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  ساعت
                </Text>
              </View>
              <View style={{ width: 30 }} />
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  className={`text-xs font-bold pt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  دقیقه
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
                  items={HOURS}
                  selectedValue={hour}
                  onValueChange={setHour}
                />
              </View>

              <View
                style={{
                  width: 30,
                  height: 162,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 30,
                }}
              >
                <Text
                  className={`text-3xl font-extrabold ${isDark ? "text-gray-600" : "text-gray-400"}`}
                  style={{
                    textAlignVertical: "center",
                    includeFontPadding: false,
                  }}
                >
                  :
                </Text>
              </View>

              <View style={{ flex: 1, height: 162 }}>
                <WheelPicker
                  items={MINUTES}
                  selectedValue={minute}
                  onValueChange={setMinute}
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
              <Text className="text-white font-bold text-sm">تأیید ساعت</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
