import { StatusBar } from "expo-status-bar"; // 👈 مدیریت رنگ نوار بالای گوشی
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 👈 محاسبه دقیق فاصله‌های گوشی
import MobileTimeline from "../components/course/MobileTimeline";
import CourseForm from "../components/form/CourseForm";
import Footer from "../components/layout/Footer";
import Topbar from "../components/layout/Topbar";
import WelcomeModal from "../components/ui/WelcomeModal";
import { useCourseStore } from "../store/useCourseStore";

export default function Home() {
  const { theme } = useCourseStore();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#090a0f" : "#f5f7fa",
        paddingTop: insets.top, // جلوگیری از رفتن زیر دوربین/ساعت
        paddingBottom: insets.bottom, // جلوگیری از رفتن زیر نوار ناوبری پایین
      }}
    >
      {/* تغییر اتوماتیک رنگ آیکون‌های استاتوس‌بار (باتری، ساعت) */}
      <StatusBar style={isDark ? "light" : "dark"} />
      <WelcomeModal />

      {/* نوار ابزار با فاصله ایمن از بالا */}
      <View
        className="absolute left-0 right-0 z-50 px-4"
        style={{ top: insets.top + 10 }}
        pointerEvents="box-none"
      >
        <Topbar />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 80,
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <CourseForm />
        <MobileTimeline />
        <View className="flex-1 min-h-[40px]" />
        <Footer />
      </ScrollView>
    </View>
  );
}
