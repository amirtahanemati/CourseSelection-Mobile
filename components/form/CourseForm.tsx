import { Check, ChevronDown, Clock, Plus, Save } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import { toEnglishDigits } from "../../utils/helpers";
import Text from "../ui/CustomText"; // 👈 فونت سفارشی
import TextInput from "../ui/CustomTextInput"; // 👈 فونت سفارشی اینپوت

export default function CourseForm() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [professor, setProfessor] = useState("");
  const [units, setUnits] = useState("");
  const [noExam, setNoExam] = useState(false);

  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <View
      className={`border rounded-3xl p-5 mb-6 shadow-sm ${isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-gray-200"}`}
    >
      <Text className="text-lg font-extrabold text-blue-500 mb-6 text-right">
        افزودن درس جدید
      </Text>

      <View className="flex-col gap-4 mb-6">
        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            کد درس
          </Text>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(toEnglishDigits(t))}
            className={`border rounded-2xl h-14 px-4 font-mono text-left ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="e.g: 40123"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          />
        </View>

        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            نام درس
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className={`border rounded-2xl h-14 px-4 text-right font-medium ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="مثال: برنامه‌نویسی پیشرفته"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            textAlign="right"
          />
        </View>

        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            نام استاد
          </Text>
          <TextInput
            value={professor}
            onChangeText={setProfessor}
            className={`border rounded-2xl h-14 px-4 text-right font-medium ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="دکتر ...."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            textAlign="right"
          />
        </View>

        <View>
          <Text
            className={`text-xs mb-2 mr-1 text-right font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            تعداد واحد
          </Text>
          <TextInput
            value={units}
            onChangeText={(t) => setUnits(toEnglishDigits(t))}
            className={`border rounded-2xl h-14 px-4 text-center font-mono ${isDark ? "bg-[#1a1c23] border-[#272a35] text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            placeholder="3"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* بخش امتحان */}
      <View
        className={`border p-4 rounded-2xl mb-6 ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50/50 border-gray-200"}`}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setNoExam(!noExam)}
          className="flex-row-reverse items-center justify-start mb-4"
        >
          <View
            className={`w-5 h-5 rounded border ml-3 items-center justify-center ${noExam ? "bg-blue-500 border-blue-500" : isDark ? "border-gray-500" : "border-gray-300 bg-white"}`}
          >
            {noExam && <Check size={14} color="white" />}
          </View>
          <Text
            className={`text-sm font-bold text-right ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            این درس امتحان ندارد
          </Text>
        </TouchableOpacity>

        <View
          className={`flex-col gap-4 ${noExam ? "opacity-30" : "opacity-100"}`}
        >
          <View>
            <Text
              className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              تاریخ امتحان
            </Text>
            <TouchableOpacity
              disabled={noExam}
              className={`h-12 rounded-xl justify-center px-4 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
            >
              <Text
                className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                انتخاب تاریخ
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text
              className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              ساعت امتحان
            </Text>
            <TouchableOpacity
              disabled={noExam}
              className={`h-12 rounded-xl flex-row items-center justify-between px-4 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
            >
              <Clock size={16} color={isDark ? "#6b7280" : "#9ca3af"} />
              <Text
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                انتخاب ساعت امتحان
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* بخش جلسات */}
      <View className="mb-6">
        <Text
          className={`text-sm font-extrabold mb-4 text-right ${isDark ? "text-white" : "text-gray-800"}`}
        >
          جلسات کلاس
        </Text>

        <View
          className={`border p-4 rounded-2xl ${isDark ? "bg-[#161822] border-[#1f222a]" : "bg-gray-50/50 border-gray-200"}`}
        >
          <View className="mb-4">
            <Text
              className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              روز هفته
            </Text>
            <TouchableOpacity
              className={`h-14 rounded-xl flex-row items-center justify-between px-4 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
            >
              <ChevronDown size={20} color={isDark ? "#6b7280" : "#9ca3af"} />
              <Text
                className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
              >
                شنبه
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row-reverse gap-3">
            <View className="flex-1">
              <Text
                className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                ساعت شروع
              </Text>
              <TouchableOpacity
                className={`h-12 rounded-xl flex-row items-center justify-between px-3 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
              >
                <Clock size={16} color={isDark ? "#6b7280" : "#9ca3af"} />
                <Text
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  شروع
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text
                className={`text-xs mb-2 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                ساعت پایان
              </Text>
              <TouchableOpacity
                className={`h-12 rounded-xl flex-row items-center justify-between px-3 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
              >
                <Clock size={16} color={isDark ? "#6b7280" : "#9ca3af"} />
                <Text
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  پایان
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity className="mt-4 flex-row-reverse items-center justify-start gap-1">
          <Plus size={14} color="#3b82f6" />
          <Text className="text-blue-500 text-xs font-bold mt-0.5">
            افزودن جلسه دیگر برای این درس
          </Text>
        </TouchableOpacity>
      </View>

      {/* دکمه ذخیره */}
      <TouchableOpacity
        className={`border h-14 rounded-2xl flex-row items-center justify-center gap-3 active:scale-[0.98] transition-transform ${isDark ? "bg-[#0f1115] border-[#1f222a]" : "bg-blue-500 border-blue-600 shadow-md"}`}
      >
        <Save size={20} color="white" />
        <Text className="text-white font-extrabold text-base">ذخیره درس</Text>
      </TouchableOpacity>
    </View>
  );
}
