import {
  BookOpen,
  CalendarDays,
  Clock,
  Hash,
  User,
  X,
} from "lucide-react-native";
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Course, useCourseStore } from "../../store/useCourseStore";
import { colorFor } from "../../utils/helpers";
import Text from "./CustomText";

interface Props {
  course: Course | null;
  onClose: () => void;
}

export default function BottomSheet({ course, onClose }: Props) {
  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  if (!course) return null;

  const baseColor = colorFor(course.name);
  const lightBgColor = baseColor.replace("hsl", "hsla").replace(")", ", 0.1)");

  return (
    <Modal
      visible={!!course}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        {/* لمس فضای خالی برای بستن مودال */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>

        {/* بدنه اصلی کشو */}
        <View
          className={`rounded-t-3xl border-t p-6 pb-10 w-full max-h-[85%] shadow-xl ${
            isDark
              ? "bg-[#12141c] border-[#1f222a]"
              : "bg-white border-gray-200"
          }`}
        >
          {/* خط تزیینی بالای کشو (Drag Indicator) */}
          <View
            className="w-12 h-1.5 rounded-full self-center mb-6"
            style={{ backgroundColor: isDark ? "#272a35" : "#e5e7eb" }}
          />

          <View className="flex-row-reverse items-center justify-between mb-6">
            <View className="flex-row-reverse items-center gap-3 flex-1">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor: lightBgColor,
                  borderColor: baseColor,
                }}
              >
                <BookOpen size={24} color={baseColor} />
              </View>
              <View className="flex-shrink">
                <Text
                  className={`text-xl font-extrabold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {course.name}
                </Text>
                <Text
                  className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  جزئیات و زمان‌بندی کلاس
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className={`p-2 rounded-full ${isDark ? "bg-[#1a1c23]" : "bg-gray-100"}`}
            >
              <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-col gap-4"
          >
            {/* اطلاعات پایه (گرید) */}
            <View className="flex-row-reverse gap-3 mb-2">
              <View
                className={`flex-1 p-4 rounded-2xl border ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50 border-gray-200"}`}
              >
                <User size={20} color="#3b82f6" className="mb-2" />
                <Text
                  className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  استاد درس
                </Text>
                <Text
                  className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  {course.professor || "نامشخص"}
                </Text>
              </View>

              <View
                className={`flex-1 p-4 rounded-2xl border ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50 border-gray-200"}`}
              >
                <Hash size={20} color="#8b5cf6" className="mb-2" />
                <Text
                  className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  کد و واحد
                </Text>
                <Text
                  className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  {course.code}{" "}
                  <Text className="text-xs text-gray-500 font-normal">
                    ({course.units} واحد)
                  </Text>
                </Text>
              </View>
            </View>

            <View
              className={`h-[1px] w-full my-3 ${isDark ? "bg-[#1f222a]" : "bg-gray-200"}`}
            ></View>

            {/* لیست جلسات */}
            <Text
              className={`text-sm font-extrabold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              زمان‌های برگزاری
            </Text>

            {course.sessions.map((session, index) => (
              <View
                key={index}
                className={`flex-row-reverse items-center justify-between p-4 rounded-xl border mb-3 ${
                  isDark
                    ? "bg-[#1a1c23] border-[#272a35]"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <View className="flex-row-reverse items-center gap-3">
                  <View
                    className={`p-2 rounded-lg ${isDark ? "bg-[#272a35]" : "bg-gray-100"}`}
                  >
                    <CalendarDays
                      size={18}
                      color={isDark ? "#d1d5db" : "#4b5563"}
                    />
                  </View>
                  <Text
                    className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
