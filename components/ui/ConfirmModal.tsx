import { AlertTriangle, Trash2 } from "lucide-react-native";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseName: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  courseName,
}: Props) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/70 px-6">
          <TouchableWithoutFeedback>
            <View className="bg-[#12141c] border border-[#1f222a] p-6 rounded-3xl w-full max-w-[320px] items-center">
              <View className="w-16 h-16 rounded-full bg-red-900/20 items-center justify-center mb-4 border border-red-900/50">
                <AlertTriangle size={32} color="#ef4444" />
              </View>

              <Text className="text-lg font-extrabold text-white mb-3">
                حذف درس
              </Text>

              <Text className="text-sm text-gray-400 mb-8 text-center leading-6">
                آیا مطمئن هستید که می‌خواهید درس{"\n"}
                <Text className="font-bold text-blue-500">«{courseName}»</Text>
                {"\n"}
                را حذف کنید؟
              </Text>

              {/* دکمه‌ها معکوس چیده شده‌اند */}
              <View className="flex-row items-center justify-between w-full gap-3">
                <TouchableOpacity
                  onPress={onConfirm}
                  className="flex-1 bg-red-500 py-3.5 rounded-xl flex-row justify-center items-center gap-2"
                >
                  <Text className="text-white font-bold text-sm">حذف</Text>
                  <Trash2 size={16} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-[#1a1c23] border border-[#272a35] py-3.5 rounded-xl items-center"
                >
                  <Text className="text-gray-300 font-bold text-sm">
                    انصراف
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
