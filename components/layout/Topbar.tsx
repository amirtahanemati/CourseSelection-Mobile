import * as Clipboard from "expo-clipboard";
import { Copy, Download, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";
import ConfirmModal from "../ui/ConfirmModal";
import Text from "../ui/CustomText";
import ExportModal from "../ui/ExportModal";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

export default function Topbar() {
  const courses = useCourseStore((state) => state.courses) || [];
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);
  const setSelectedCourseId = useCourseStore(
    (state) => state.setSelectedCourseId,
  );

  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const totalUnits = courses.reduce(
    (sum, course) => sum + (course.units || 0),
    0,
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleDeleteClick = () => {
    if (!selectedCourseId) {
      Toast.show({ type: "error", text1: "ابتدا یک درس را انتخاب کنید." });
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeDelete = () => {
    if (selectedCourseId) {
      deleteCourse(selectedCourseId);
      setSelectedCourseId(null);
      Toast.show({ type: "success", text1: "درس با موفقیت حذف شد." });
    }
    setIsConfirmOpen(false);
  };

  const handleCopyCodes = async () => {
    if (courses.length === 0)
      return Toast.show({ type: "error", text1: "درسی برای کپی وجود ندارد." });
    const codes = courses.map((c) => `${c.code} - ${c.name}`).join("\n");
    await Clipboard.setStringAsync(codes);
    Toast.show({ type: "success", text1: "کد دروس در کلیپ‌بورد کپی شد." });
  };

  return (
    <>
      <View
        className={`rounded-2xl flex-row items-center justify-between p-2 shadow-sm border ${
          isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-gray-200"
        }`}
      >
        <View className="flex-row items-center gap-1 shrink-0">
          <ThemeToggle />

          <View
            className={`w-[1px] h-4 mx-0.5 ${isDark ? "bg-[#2a2d35]" : "bg-gray-200"}`}
          ></View>

          <TouchableOpacity
            onPress={() => setIsExportMenuOpen(true)}
            className={`w-7 h-7 items-center justify-center rounded-xl ${isDark ? "bg-[#1f222a]" : "bg-gray-100"}`}
          >
            <Download size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopyCodes}
            className={`w-7 h-7 items-center justify-center rounded-xl ${isDark ? "bg-[#1f222a]" : "bg-gray-100"}`}
          >
            <Copy size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteClick}
            className={`w-7 h-7 items-center justify-center rounded-xl ${isDark ? "bg-[#2d1b1e]" : "bg-red-50"}`}
          >
            <Trash2 size={14} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedCourseId(null)}
            className={`w-7 h-7 items-center justify-center rounded-xl ${isDark ? "bg-[#172033]" : "bg-blue-50"}`}
          >
            <Plus size={14} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2 shrink">
          <View className="justify-center items-end flex-shrink">
            <Text
              className={`text-[13px] font-extrabold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
              numberOfLines={1}
            >
              ابزار انتخاب واحد
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View
                className={`flex-row items-center gap-0.5 px-1.5 rounded border ${isDark ? "bg-[#172033] border-[#1e3a8a]" : "bg-blue-50 border-blue-200"}`}
              >
                <Text className="text-[10px] font-mono font-bold text-blue-500">
                  {totalUnits}
                </Text>
                <Text className="text-[9px] text-blue-500 font-bold">
                  واحد:
                </Text>
              </View>
              <View
                className={`flex-row items-center gap-0.5 px-1.5 rounded border ${isDark ? "bg-[#1f222a] border-[#1f222a]" : "bg-gray-100 border-gray-200"}`}
              >
                <Text
                  className={`text-[10px] font-mono font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {courses.length}
                </Text>
                <Text
                  className={`text-[9px] font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  دروس:
                </Text>
              </View>
            </View>
          </View>

          <View className="w-8 h-8 rounded-lg items-center justify-center shrink-0">
            <Logo height={36} width={36} />
          </View>
        </View>
      </View>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        courseName={selectedCourse?.name || "انتخاب شده"}
      />

      {/* 👇 Fixed prop name from isOpen to visible */}
      <ExportModal
        visible={isExportMenuOpen}
        onClose={() => setIsExportMenuOpen(false)}
      />
    </>
  );
}
