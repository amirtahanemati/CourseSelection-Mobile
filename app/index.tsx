import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

  const bgColor = isDark ? "#090a0f" : "#f5f7fa";

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <WelcomeModal />

      {/* ۱. لایه ماسک (Mask Layer): */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 35,
          backgroundColor: bgColor,
          zIndex: 40,
        }}
      />

      {/* ۲. تاپ‌بار شناور (Floating Topbar) */}
      <View
        className="absolute left-0 right-0 z-50 px-4"
        style={{ top: insets.top + 12 }}
        pointerEvents="box-none"
      >
        <Topbar />
      </View>

      {/* ۳. اسکرول‌ویو */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 90,
          paddingHorizontal: 16,
          paddingBottom: 32 + insets.bottom,
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
