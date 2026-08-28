import {
  FileJson,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react-native";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: Props) {
  // TODO: پیاده‌سازی منطق اکسپورت فایل در مراحل آینده
  const placeholderAction = (type: string) => {
    Toast.show({
      type: "info",
      text1: `قابلیت خروجی ${type} به زودی اضافه می‌شود.`,
    });
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>

        <View className="bg-[#12141c] border-t border-[#1f222a] p-6 rounded-t-3xl w-full pb-10">
          <View className="flex-row items-center justify-between mb-6 border-b border-[#1f222a] pb-4">
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-[#1a1c23] rounded-full"
            >
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
            <Text className="text-lg font-extrabold text-blue-500">
              خروجی و اشتراک‌گذاری
            </Text>
          </View>

          <View className="flex-col gap-3">
            <TouchableOpacity
              onPress={() => placeholderAction("PNG")}
              className="bg-[#1a1c23] border border-[#272a35] flex-row-reverse items-center justify-start px-5 py-4 rounded-2xl gap-4"
            >
              <ImageIcon size={22} color="#3b82f6" />
              <Text className="text-sm font-bold text-white text-right flex-1">
                دانلود به صورت عکس (PNG)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => placeholderAction("PDF")}
              className="bg-[#1a1c23] border border-[#272a35] flex-row-reverse items-center justify-start px-5 py-4 rounded-2xl gap-4"
            >
              <FileText size={22} color="#ef4444" />
              <Text className="text-sm font-bold text-white text-right flex-1">
                دانلود به صورت فایل PDF
              </Text>
            </TouchableOpacity>

            <View className="h-[1px] w-full bg-[#1f222a] my-2"></View>

            <TouchableOpacity
              onPress={() => placeholderAction("JSON Export")}
              className="bg-[#1a1c23] border border-[#272a35] flex-row-reverse items-center justify-start px-5 py-4 rounded-2xl gap-4"
            >
              <FileJson size={22} color="#22c55e" />
              <Text className="text-sm font-bold text-white text-right flex-1">
                خروجی فایل JSON (بکاپ)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => placeholderAction("JSON Import")}
              className="bg-[#1a1c23] border border-[#272a35] flex-row-reverse items-center justify-start px-5 py-4 rounded-2xl gap-4"
            >
              <Upload size={22} color="#9ca3af" />
              <Text className="text-sm font-bold text-white text-right flex-1">
                وارد کردن برنامه (Import)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
