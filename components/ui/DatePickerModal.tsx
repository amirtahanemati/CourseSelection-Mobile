import { Check, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";
import WheelPicker from "./WheelPicker";

// اصلاح بازه سال‌ها مطابق درخواست شما
const YEARS = ["1405", "1406", "1407", "1408", "1409", "1410"];
const MONTHS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0"),
);
const DAYS = Array.from({ length: 31 }, (_, i) =>
  (i + 1).toString().padStart(2, "0"),
);

interface Props {
  visible: boolean;
  initialDate: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
}

export default function DatePickerModal({
  visible,
  initialDate,
  onConfirm,
  onClose,
}: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";
  const [year, setYear] = useState("1405");
  const [month, setMonth] = useState("01");
  const [day, setDay] = useState("01");

  useEffect(() => {
    if (visible && initialDate.includes("/")) {
      const [y, m, d] = initialDate.split("/");
      setYear(YEARS.includes(y) ? y : "1405"); // پیشگیری از کرش اگر سال نامعتبر بود
      setMonth(m);
      setDay(d);
    }
  }, [visible, initialDate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
        <View
          className={`rounded-t-3xl p-6 pb-10 w-full ${isDark ? "bg-[#12141c]" : "bg-white"}`}
        >
          <Text
            className={`text-lg font-bold text-center mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            انتخاب تاریخ امتحان
          </Text>

          {/* تغییر به flex-row (LTR) برای قرارگیری صحیح سال/ماه/روز */}
          <View
            className={`flex-row items-center justify-center p-4 rounded-3xl border mb-6 ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
          >
            <WheelPicker
              items={YEARS}
              selectedValue={year}
              onValueChange={setYear}
            />
            <Text className="text-xl font-bold text-gray-400">/</Text>
            <WheelPicker
              items={MONTHS}
              selectedValue={month}
              onValueChange={setMonth}
            />
            <Text className="text-xl font-bold text-gray-400">/</Text>
            <WheelPicker
              items={DAYS}
              selectedValue={day}
              onValueChange={setDay}
            />
          </View>

          <View className="flex-row-reverse gap-3">
            <TouchableOpacity
              onPress={() => onConfirm(`${year}/${month}/${day}`)}
              className="flex-1 bg-blue-500 py-3.5 rounded-xl flex-row-reverse items-center justify-center gap-2"
            >
              <Check size={18} color="white" />
              <Text className="text-white font-bold">تأیید</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className={`flex-1 py-3.5 rounded-xl flex-row-reverse items-center justify-center gap-2 border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-100 border-gray-200"}`}
            >
              <X size={18} color={isDark ? "#d1d5db" : "#4b5563"} />
              <Text
                className={`font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                انصراف
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
