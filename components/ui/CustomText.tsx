import React from "react";
import { Text as RNText, StyleSheet, TextProps } from "react-native";

export default function CustomText({ style, ...props }: TextProps) {
  // ۱. تبدیل تمام استایل‌های تایلویند به یک آبجکت قابل خواندن
  const flatStyle = StyleSheet.flatten(style || {}) as any;

  // ۲. فونت پیش‌فرض (وزن معمولی)
  let customFontFamily = "DanaFaNum-Regular";

  // ۳. پیدا کردن کلاس‌های وزن فونت (مثل font-bold یا font-extrabold)
  if (flatStyle.fontWeight) {
    const weight = flatStyle.fontWeight.toString();

    if (weight === "bold" || weight === "700") {
      customFontFamily = "DanaFaNum-Bold";
    } else if (weight === "800" || weight === "900" || weight === "extrabold") {
      customFontFamily = "DanaFaNum-ExtraBold";
    } else if (weight === "500" || weight === "600" || weight === "medium") {
      // اگر فایل Medium را نداری، اینجا را هم روی Regular تنظیم کن
      customFontFamily = "DanaFaNum-Bold";
    }

    // ۴. ترفند طلایی: پاک کردن fontWeight تا سیستم‌عامل موبایل فونت را خراب نکند
    delete flatStyle.fontWeight;
  }

  return (
    <RNText
      {...props}
      style={[flatStyle, { fontFamily: customFontFamily, textAlign: "right" }]}
    />
  );
}
