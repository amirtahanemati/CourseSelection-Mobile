import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import { Course } from "../../types";
import { colorFor, parseTimeToMinutes } from "../../utils/helpers";
import BottomSheet from "../ui/BottomSheet";
import Text from "../ui/CustomText";

export const DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
];

export default function MobileTimeline() {
  const courses = useCourseStore((state) => state.courses) || [];
  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);
  const setSelectedCourseId = useCourseStore(
    (state) => state.setSelectedCourseId,
  );

  const [activeDay, setActiveDay] = useState<string>(DAYS[0]);
  const [bottomSheetCourse, setBottomSheetCourse] = useState<Course | null>(
    null,
  );

  const daySessions = courses.flatMap((course) => {
    const sessionsForDay = course.sessions.filter((s) => s.day === activeDay);
    return sessionsForDay.map((session) => ({ course, session }));
  });

  daySessions.sort(
    (a, b) =>
      parseTimeToMinutes(a.session.start) - parseTimeToMinutes(b.session.start),
  );

  return (
    <View className="flex-col pb-10">
      {/* 👇 ترفند مقیاس منفی: اسکرول از سمت راست شروع می‌شود */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        style={{ transform: [{ scaleX: -1 }] }}
        contentContainerStyle={{
          paddingHorizontal: 4,
          gap: 8,
        }}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setActiveDay(day)}
            activeOpacity={0.7}
            style={{ transform: [{ scaleX: -1 }] }} // 👈 برگرداندن کارت به جهت درست تا آینه نشود
            className={`px-6 py-3 rounded-2xl border ${
              activeDay === day
                ? "bg-blue-500 border-blue-500 shadow-sm"
                : isDark
                  ? "bg-[#191b24] border-[#272a35]"
                  : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <Text
              className={`font-extrabold text-sm ${activeDay === day ? "text-white" : isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="flex-col gap-4">
        {daySessions.length === 0 ? (
          <View
            className={`border-dashed border-2 rounded-[32px] p-10 items-center justify-center ${isDark ? "bg-[#12141c] border-[#272a35]" : "bg-gray-50 border-gray-300"}`}
          >
            <Text className="text-4xl mb-4">😴</Text>
            <Text
              className={`font-extrabold text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              کلاسی در این روز نداری!
            </Text>
          </View>
        ) : (
          daySessions.map(({ course, session }, index) => {
            const baseColor = colorFor(course.name);
            const isSelected = selectedCourseId === course.id;

            const glassBg = isSelected
              ? isDark
                ? "rgba(59, 130, 246, 0.15)"
                : "rgba(59, 130, 246, 0.1)"
              : baseColor
                  .replace("hsl", "hsla")
                  .replace(")", isDark ? ", 0.12)" : ", 0.08)");

            const borderStyle = isSelected
              ? "border-blue-500"
              : isDark
                ? "border-[#1f222a]"
                : "border-gray-100";

            return (
              <TouchableOpacity
                key={`${course.id}-${index}`}
                onPress={() => {
                  if (selectedCourseId) {
                    setSelectedCourseId(isSelected ? null : course.id);
                  } else {
                    setBottomSheetCourse(course);
                  }
                }}
                onLongPress={() =>
                  setSelectedCourseId(isSelected ? null : course.id)
                }
                activeOpacity={0.7}
                className="flex-row-reverse items-stretch gap-4 relative"
              >
                <View className="flex-col items-center w-14">
                  <View
                    className={`border px-2 py-1 rounded-lg ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200 shadow-sm"}`}
                  >
                    <Text
                      className={`font-bold text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {session.start}
                    </Text>
                  </View>
                  <View
                    className={`w-[2px] flex-1 my-1 rounded-full ${isDark ? "bg-[#1f222a]" : "bg-gray-200"}`}
                  ></View>
                  <Text
                    className={`text-[10px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {session.end}
                  </Text>
                </View>

                <View
                  className={`flex-1 rounded-3xl p-4 border-2 shadow-sm ${borderStyle}`}
                  style={{
                    backgroundColor: glassBg,
                    borderRightWidth: 4,
                    borderRightColor: isSelected ? "#3b82f6" : baseColor,
                  }}
                >
                  {isSelected && (
                    <View className="absolute top-3 left-3 w-6 h-6 bg-blue-500 rounded-full items-center justify-center shadow-md z-10">
                      <Check size={14} color="white" strokeWidth={3} />
                    </View>
                  )}

                  <Text
                    className={`font-extrabold text-base mb-1 text-right leading-6 ${isDark ? "text-white" : "text-gray-900"} ${isSelected ? "pr-6" : ""}`}
                  >
                    {course.name}
                  </Text>

                  <View className="flex-row-reverse items-center justify-between mt-3">
                    <Text
                      className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      استاد: {course.professor || "-"}
                    </Text>
                    <View
                      className={`border px-2.5 py-1 rounded-lg ${isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white/60 border-gray-200"}`}
                    >
                      <Text
                        className={`text-[10px] font-mono font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {course.code}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <BottomSheet
        course={bottomSheetCourse}
        onClose={() => setBottomSheetCourse(null)}
      />
    </View>
  );
}
