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

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = ["00", "15", "30", "45"];

interface Props {
  visible: boolean;
  initialTime: string;
  onConfirm: (time: string) => void;
  onClose: () => void;
}

export default function TimePickerModal({
  visible,
  initialTime,
  onConfirm,
  onClose,
}: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");

  useEffect(() => {
    if (visible && initialTime.includes(":")) {
      const [h, m] = initialTime.split(":");
      setHour(h.padStart(2, "0"));
      setMinute(MINUTES.includes(m) ? m : "00");
    }
  }, [visible, initialTime]);

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
            انتخاب ساعت
          </Text>

          {/* تغییر به flex-row (LTR) برای قرارگیری صحیح اعداد */}
          <View
            className={`flex-row items-center justify-center p-4 rounded-3xl border mb-6 ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
          >
            <WheelPicker
              items={HOURS}
              selectedValue={hour}
              onValueChange={setHour}
            />
            <Text className="text-2xl font-bold text-blue-500 mb-2 pb-1">
              :
            </Text>
            <WheelPicker
              items={MINUTES}
              selectedValue={minute}
              onValueChange={setMinute}
            />
          </View>

          <View className="flex-row-reverse gap-3">
            <TouchableOpacity
              onPress={() => onConfirm(`${hour}:${minute}`)}
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
