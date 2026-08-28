import {
  BookOpen,
  CalendarDays,
  Clock,
  Edit3,
  Hash,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Course, useCourseStore } from "../../store/useCourseStore";
import { colorFor } from "../../utils/helpers";
import Text from "./CustomText";

interface Props {
  course: Course | null;
  onClose: () => void;
}

const { height } = Dimensions.get("window");

export default function BottomSheet({ course, onClose }: Props) {
  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);
  const setSelectedCourseId = useCourseStore(
    (state) => state.setSelectedCourseId,
  );
  const deleteCourse = useCourseStore((state) => state.deleteCourse);

  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (course) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
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
      ]).start(() => setVisible(false));
    }
  }, [course]);

  if (!visible && !course) return null;

  const activeCourse = course || ({} as Course);
  const isSelected = selectedCourseId === activeCourse.id;

  const baseColor = activeCourse.name ? colorFor(activeCourse.name) : "#3b82f6";
  const lightBgColor = baseColor
    .replace("hsl", "hsla")
    .replace(")", isDark ? ", 0.15)" : ", 0.1)");

  const handleDelete = () => {
    deleteCourse(activeCourse.id);
    if (isSelected) setSelectedCourseId(null);
    Toast.show({ type: "success", text1: "درس با موفقیت حذف شد." });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="absolute inset-0 bg-black/60"
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            // اضافه شدن سایه رو به بالا
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 15,
            elevation: 20,
          }}
          className={`rounded-t-[32px] p-6 pb-10 w-full max-h-[90%] ${isDark ? "bg-[#12141c]" : "bg-white"}`}
        >
          <View
            className="w-12 h-1.5 rounded-full self-center mb-6"
            style={{ backgroundColor: isDark ? "#2a2d35" : "#e5e7eb" }}
          />

          <View className="flex-row-reverse items-center justify-between mb-8">
            <View className="flex-row-reverse items-center gap-4 flex-1">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center border"
                style={{
                  backgroundColor: lightBgColor,
                  borderColor: baseColor,
                }}
              >
                <BookOpen size={26} color={baseColor} />
              </View>
              <View className="flex-shrink">
                <Text
                  className={`text-xl font-extrabold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {activeCourse.name}
                </Text>
                <Text
                  className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  جزئیات و زمان‌بندی کلاس
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className={`p-2.5 rounded-full ${isDark ? "bg-[#1a1c23]" : "bg-gray-100"}`}
            >
              <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-col">
            <View className="flex-row-reverse gap-3 mb-6">
              <View
                className={`flex-1 p-4 rounded-2xl border ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50 border-gray-100"}`}
              >
                <User size={20} color="#3b82f6" className="mb-2" />
                <Text
                  className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  استاد درس
                </Text>
                <Text
                  className={`text-sm font-extrabold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  {activeCourse.professor || "نامشخص"}
                </Text>
              </View>
              <View
                className={`flex-1 p-4 rounded-2xl border ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50 border-gray-100"}`}
              >
                <Hash size={20} color="#8b5cf6" className="mb-2" />
                <Text
                  className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  کد و واحد
                </Text>
                <Text
                  className={`text-sm font-extrabold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  {activeCourse.code}{" "}
                  <Text className="text-xs text-gray-500 font-normal">
                    ({activeCourse.units} واحد)
                  </Text>
                </Text>
              </View>
            </View>

            <Text
              className={`text-sm font-extrabold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              زمان‌های برگزاری
            </Text>
            <View className="mb-6">
              {activeCourse.sessions?.map((session, index) => (
                <View
                  key={index}
                  className={`flex-row-reverse items-center justify-between p-4 rounded-2xl border mb-2 ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200 shadow-sm"}`}
                >
                  <View className="flex-row-reverse items-center gap-3">
                    <View
                      className={`p-2 rounded-xl ${isDark ? "bg-[#272a35]" : "bg-blue-50"}`}
                    >
                      <CalendarDays
                        size={18}
                        color={isDark ? "#d1d5db" : "#3b82f6"}
                      />
                    </View>
                    <Text
                      className={`text-base font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {session.day}
                    </Text>
                  </View>
                  <View className="flex-row-reverse items-center gap-2">
                    <Clock size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
                    <Text
                      className={`text-sm font-mono font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {session.start}{" "}
                      <Text
                        className={`font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        تا
                      </Text>{" "}
                      {session.end}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="flex-row-reverse gap-3 mb-4 mt-2">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Toast.show({ type: "info", text1: "به زودی..." });
                  onClose();
                }}
                className={`flex-1 flex-row-reverse items-center justify-center gap-2 py-3.5 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
              >
                <Edit3 size={18} color={isDark ? "#d1d5db" : "#4b5563"} />
                <Text
                  className={`font-bold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  ویرایش
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                className="flex-1 flex-row-reverse items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20"
              >
                <Trash2 size={18} color="#ef4444" />
                <Text className="text-red-500 font-bold text-sm">حذف درس</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
