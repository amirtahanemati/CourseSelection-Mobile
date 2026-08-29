import {
  AlertTriangle,
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
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  const [showConfirm, setShowConfirm] = useState(false);

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
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
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
    if (course) {
      setVisible(true);
      setShowConfirm(false);
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
      ]).start(() => {
        setVisible(false);
        setShowConfirm(false);
      });
    }
  }, [course]);

  if (!visible && !course) return null;

  const activeCourse = course || ({} as Course);
  const isSelected = selectedCourseId === activeCourse.id;

  const baseColor = activeCourse.name ? colorFor(activeCourse.name) : "#3b82f6";
  const lightBgColor = baseColor
    .replace("hsl", "hsla")
    .replace(")", isDark ? ", 0.15)" : ", 0.1)");

  const handleClose = () => {
    onClose();
  };

  const executeDelete = () => {
    deleteCourse(activeCourse.id);
    if (isSelected) setSelectedCourseId(null);
    Toast.show({ type: "success", text1: "درس با موفقیت حذف شد." });
    handleClose();
  };

  const handleEdit = () => {
    setSelectedCourseId(activeCourse.id);
    handleClose();
    Toast.show({
      type: "info",
      text1: "حالت ویرایش فعال شد",
      text2: "فرم بالای صفحه را بررسی کنید.",
    });
  };

  return (
    <Modal
      visible={visible}
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
          className={`rounded-t-[32px] pb-10 w-full max-h-[90%] border-t ${isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-transparent"}`}
        >
          <View
            {...panResponder.panHandlers}
            style={{ backgroundColor: "transparent" }}
            className="px-6 pt-5"
          >
            <View
              className="w-16 h-1.5 rounded-full self-center mb-6 mt-1"
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
                  {/* 
                      👇 باگ برش خوردن متن (Clipping) حل شد:
                      کلاس‌های pt-1 و leading-8 اضافه شدند تا کلاه حرف «آ» زیر باکس نرود 
                  */}
                  <Text
                    className={`text-xl font-extrabold mb-1 pt-1 leading-8 ${isDark ? "text-white" : "text-gray-900"}`}
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
                onPress={handleClose}
                activeOpacity={0.7}
                className={`p-2.5 rounded-full ${isDark ? "bg-[#1a1c23]" : "bg-gray-100"}`}
              >
                <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-col px-6"
          >
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

            <View className="mt-2 mb-4">
              {showConfirm ? (
                <View
                  className={`p-4 rounded-3xl border ${isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"}`}
                >
                  <View className="flex-row-reverse items-center justify-center gap-2 mb-5">
                    <AlertTriangle size={20} color="#ef4444" />
                    <Text className="text-red-500 font-extrabold text-sm text-center">
                      آیا از حذف این درس مطمئن هستید؟
                    </Text>
                  </View>

                  {/* 👇 دکمه‌های تاییدیه خطی نیز جابجا شدند */}
                  <View className="flex-row-reverse gap-3">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowConfirm(false)}
                      className={`flex-1 py-3.5 rounded-xl items-center justify-center border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
                    >
                      <Text
                        className={`font-bold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        انصراف
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={executeDelete}
                      className="flex-1 py-3.5 rounded-xl bg-red-500 items-center justify-center shadow-sm"
                    >
                      <Text className="text-white font-extrabold text-sm">
                        بله، حذف کن
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="flex-row-reverse gap-3">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleEdit}
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
                    onPress={() => setShowConfirm(true)}
                    className="flex-1 flex-row-reverse items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20"
                  >
                    <Trash2 size={18} color="#ef4444" />
                    <Text className="text-red-500 font-bold text-sm">
                      حذف درس
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
