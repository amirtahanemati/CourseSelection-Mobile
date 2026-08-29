/// <reference types="nativewind/types" />
import { AlertCircle, CheckCircle2, Info } from "lucide-react-native";
import React from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import Toast, { ToastConfigParams } from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";

const { width } = Dimensions.get("window");

type ToastType = "success" | "error" | "info";

interface CustomToastProps extends ToastConfigParams<any> {
  type: ToastType;
}

const CustomToast = ({ text1, text2, type }: CustomToastProps) => {
  const isDark = useCourseStore((state) => state.theme) === "dark";

  let iconColor = "#3b82f6"; // Blue
  if (type === "success") iconColor = "#10b981"; // Emerald
  if (type === "error") iconColor = "#ef4444"; // Red

  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => Toast.hide()}
      style={{
        width: width - 48, // عرض کمتر و جمع‌وجورتر
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 }, // سایه ظریف‌تر
        shadowOpacity: isDark ? 0.6 : 0.06,
        shadowRadius: 16,
        elevation: 10,
      }}
      className={`flex-row-reverse items-center py-2.5 px-3 rounded-2xl border ${
        isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-100"
      }`}
    >
      {/* باکس آیکون کوچیک‌تر */}
      <View
        className={`w-9 h-9 rounded-full items-center justify-center shrink-0 ${
          type === "success"
            ? "bg-emerald-500/10"
            : type === "error"
              ? "bg-red-500/10"
              : "bg-blue-500/10"
        }`}
      >
        <Icon size={20} color={iconColor} strokeWidth={2.5} />
      </View>

      {/* بخش متن با سایزهای بهینه‌شده */}
      <View className="flex-1 px-3 justify-center pt-0.5">
        {text1 ? (
          <Text
            className={`text-[14px] font-extrabold text-right ${
              text2 ? "mb-0.5" : ""
            } ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text
            className={`text-[11px] font-bold text-right leading-5 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {text2}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export const toastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <CustomToast {...props} type="success" />
  ),
  error: (props: ToastConfigParams<any>) => (
    <CustomToast {...props} type="error" />
  ),
  info: (props: ToastConfigParams<any>) => (
    <CustomToast {...props} type="info" />
  ),
};
