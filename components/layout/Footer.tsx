import { Info, X } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import CreditsModal from "../ui/CreditsModal";
import Text from "../ui/CustomText";

interface FooterProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export default function Footer({ isFloating = false, onClose }: FooterProps) {
  const isDark = useCourseStore((state) => state.theme) === "dark";
  const [showCredits, setShowCredits] = useState(false);

  return (
    <View className={`items-center w-full ${isFloating ? "" : "mt-2 mb-4"}`}>
      <View
        className={`w-full flex-row-reverse items-center justify-between px-4 py-4 rounded-[20px] border ${
          isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"
        }`}
        style={{
          shadowColor: isDark ? "#000" : "#94a3b8",
          shadowOffset: { width: 0, height: isFloating ? 8 : 4 },
          shadowOpacity: isDark ? 0.3 : isFloating ? 0.15 : 0.05,
          shadowRadius: isFloating ? 16 : 12,
          elevation: isFloating ? 10 : 2,
        }}
      >
        {/* بخش کلیک‌خور برای باز کردن مودال توسعه‌دهندگان */}
        <TouchableOpacity
          onPress={() => setShowCredits(true)}
          activeOpacity={0.7}
          className="flex-1 flex-row-reverse items-center gap-3"
        >
          <View
            className={`w-11 h-11 rounded-full items-center justify-center ${
              isDark ? "bg-[#12141c]" : "bg-blue-50"
            }`}
          >
            <Info size={22} color={isDark ? "#3b82f6" : "#2563eb"} />
          </View>
          <View>
            <Text
              className={`text-[13px] font-extrabold text-right ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              درباره ما و تیم سازنده
            </Text>
            <Text
              className={`text-[10px] text-right mt-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              طراحان پروژه و لینک‌های ارتباطی
            </Text>
          </View>
        </TouchableOpacity>

        {/* دکمه بستن یا آیکون ثابت بر اساس حالت شناور بودن */}
        <View className="pl-1">
          {isFloating ? (
            <TouchableOpacity
              onPress={onClose}
              className={`w-8 h-8 rounded-full items-center justify-center ${
                isDark ? "bg-[#12141c]" : "bg-gray-100"
              }`}
            >
              <X size={16} color={isDark ? "#9ca3af" : "#64748b"} />
            </TouchableOpacity>
          ) : (
            <Text className="text-2xl mr-1">👋</Text>
          )}
        </View>
      </View>

      <CreditsModal
        visible={showCredits}
        onClose={() => setShowCredits(false)}
      />
    </View>
  );
}
