import { ArrowUpCircle, ExternalLink, Sparkles, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import { openMyket, snoozeUpdateNoticeAsync } from "../../utils/updateChecker";
import Text from "./CustomText";

interface Props {
  visible: boolean;
  latestVersion: string;
  currentVersion: string;
  onClose: () => void;
}

export default function UpdateModal({
  visible,
  latestVersion,
  currentVersion,
  onClose,
}: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const handleUpdateClick = async () => {
    onClose();
    await openMyket();
  };

  const handleLaterClick = async () => {
    await snoozeUpdateNoticeAsync();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleLaterClick}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleLaterClick}>
        <View className="flex-1 justify-center items-center px-5 bg-black/60">
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              }}
              className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
                isDark
                  ? "bg-[#161822] border-[#262a38]"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* دکمه بستن در گوشه بالا */}
              <TouchableOpacity
                onPress={handleLaterClick}
                activeOpacity={0.7}
                className={`absolute top-4 left-4 w-8 h-8 rounded-full items-center justify-center z-10 ${
                  isDark ? "bg-[#212534]" : "bg-gray-100"
                }`}
              >
                <X size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>

              {/* آیکون بالای مدال */}
              <View className="items-center mb-4">
                <View
                  className={`w-16 h-16 rounded-2xl items-center justify-center shadow-lg ${
                    isDark
                      ? "bg-blue-600/20 border border-blue-500/30"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <ArrowUpCircle
                    size={36}
                    color="#3b82f6"
                    strokeWidth={2.2}
                  />
                </View>
              </View>

              {/* عنوان مدال */}
              <View className="items-center mb-3">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Sparkles size={16} color="#eab308" />
                  <Text
                    className={`text-lg font-extrabold text-center ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    بروزرسانی جدید در مایکت
                  </Text>
                </View>
                <Text
                  className={`text-xs text-center ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  نسخه تازه اپلیکیشن ابزار انتخاب واحد آماده است
                </Text>
              </View>

              {/* برچسب‌های مقایسه نسخه */}
              <View
                className={`flex-row items-center justify-center gap-2 p-2.5 rounded-xl mb-4 ${
                  isDark ? "bg-[#1c202e]" : "bg-gray-50"
                }`}
              >
                <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                  <Text className="text-[11px] font-bold text-emerald-500">
                    نسخه جدید: v{latestVersion}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-500/10 border border-gray-500/20">
                  <Text
                    className={`text-[11px] font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    فعلی: v{currentVersion}
                  </Text>
                </View>
              </View>

              {/* توضیحات بروزرسانی */}
              <Text
                className={`text-[13px] leading-6 text-center mb-6 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                برای بهره‌مندی از ویژگی‌های جدید، رفع اشکالات و تجربه روان‌تر،
                همین حالا برنامه را از طریق مایکت بروزرسانی کنید.
              </Text>

              {/* دکمه‌های اقدام */}
              <View className="gap-2.5">
                <TouchableOpacity
                  onPress={handleUpdateClick}
                  activeOpacity={0.85}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 active:bg-blue-700 flex-row items-center justify-center gap-2 shadow-md shadow-blue-500/30"
                >
                  <ExternalLink size={18} color="#ffffff" />
                  <Text className="text-white font-bold text-sm">
                    بروزرسانی از مایکت
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLaterClick}
                  activeOpacity={0.7}
                  className={`w-full py-2.5 rounded-xl items-center justify-center ${
                    isDark ? "active:bg-[#202534]" : "active:bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    بعداً یادآوری کن
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
