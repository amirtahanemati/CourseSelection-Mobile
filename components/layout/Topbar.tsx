import * as Clipboard from "expo-clipboard";
import { Copy, Download } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "../ui/CustomText";
import ExportModal from "../ui/ExportModal";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

interface Props {
  onExportImage?: () => Promise<void>;
}

export default function Topbar({ onExportImage }: Props) {
  const courses = useCourseStore((state) => state.courses) || [];
  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const totalUnits = courses.reduce(
    (sum, course) => sum + (course.units || 0),
    0,
  );

  const handleCopyCodes = async () => {
    if (courses.length === 0) {
      return Toast.show({
        type: "error",
        text1: "درسی برای کپی وجود ندارد.",
      });
    }
    const codes = courses.map((c) => `${c.code} - ${c.name}`).join("\n");
    await Clipboard.setStringAsync(codes);
    Toast.show({ type: "success", text1: "کد دروس در کلیپ‌بورد کپی شد." });
  };

  return (
    <>
      <View
        className={`rounded-2xl flex-row items-center justify-between px-3.5 py-2.5 shadow-sm border ${
          isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-gray-200"
        }`}
      >
        {/* بخش دکمه‌های اکشن سمت چپ (تم، خروجی، کپی) */}
        <View className="flex-row items-center gap-2 shrink-0">
          <ThemeToggle />

          <View
            className={`w-[1px] h-4 mx-0.5 ${
              isDark ? "bg-[#2a2d35]" : "bg-gray-200"
            }`}
          />

          <TouchableOpacity
            onPress={() => setIsExportMenuOpen(true)}
            activeOpacity={0.7}
            className={`w-9 h-9 items-center justify-center rounded-xl border ${
              isDark
                ? "bg-[#1a1c23] border-[#272a35] active:bg-[#232733]"
                : "bg-gray-50 border-gray-200 active:bg-gray-100"
            }`}
          >
            <Download size={16} color={isDark ? "#9ca3af" : "#4b5563"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopyCodes}
            activeOpacity={0.7}
            className={`w-9 h-9 items-center justify-center rounded-xl border ${
              isDark
                ? "bg-[#1a1c23] border-[#272a35] active:bg-[#232733]"
                : "bg-gray-50 border-gray-200 active:bg-gray-100"
            }`}
          >
            <Copy size={16} color={isDark ? "#9ca3af" : "#4b5563"} />
          </TouchableOpacity>
        </View>

        {/* بخش برند، نام و وضعیت دروس سمت راست */}
        <View className="flex-row items-center gap-2.5 shrink">
          <View className="justify-center items-end flex-shrink">
            <Text
              className={`text-[13px] font-extrabold mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              numberOfLines={1}
            >
              ابزار انتخاب واحد
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View
                className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md border ${
                  isDark
                    ? "bg-[#172033] border-[#1e3a8a]/60"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <Text className="text-[11px] font-mono font-bold text-blue-500">
                  {totalUnits}
                </Text>
                <Text className="text-[10px] text-blue-500 font-bold">
                  واحد:
                </Text>
              </View>
              <View
                className={`flex-row items-center gap-1 px-2 py-0.5 rounded-md border ${
                  isDark
                    ? "bg-[#1f222a] border-[#272a35]"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <Text
                  className={`text-[11px] font-mono font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {courses.length}
                </Text>
                <Text
                  className={`text-[10px] font-bold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  دروس:
                </Text>
              </View>
            </View>
          </View>

          <View className="w-9 h-9 rounded-xl items-center justify-center shrink-0">
            <Logo height={38} width={38} />
          </View>
        </View>
      </View>

      <ExportModal
        visible={isExportMenuOpen}
        onClose={() => setIsExportMenuOpen(false)}
        onExportImage={onExportImage}
      />
    </>
  );
}
