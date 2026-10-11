import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { I18nManager, Linking, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import AnimatedSplash from "../components/ui/AnimatedSplash";
import { toastConfig } from "../components/ui/ToastConfig";
import { useCourseStore } from "../store/useCourseStore";
import { syncAllNotifications } from "../utils/notifications";

// غیرفعال کردن RTL نیتیو برای جلوگیری از باگ لمسی اندروید
try {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
} catch {}

// جلوگیری ایمن از بسته شدن زودهنگام اسپلش اسکرین
SplashScreen.preventAutoHideAsync().catch(() => {});

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#090a0f",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        خطایی در اجرای برنامه رخ داد
      </Text>
      <Text
        style={{
          color: "#f87171",
          fontSize: 13,
          textAlign: "center",
          marginBottom: 24,
          lineHeight: 20,
        }}
      >
        {error?.message || "خطای ناشناخته"}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{
          backgroundColor: "#2563eb",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "bold" }}>تلاش مجدد</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DanaFaNum: require("../assets/fonts/DanaFaNum-Regular.ttf"),
    "DanaFaNum-Regular": require("../assets/fonts/DanaFaNum-Regular.ttf"),
    "DanaFaNum-Bold": require("../assets/fonts/DanaFaNum-Bold.ttf"),
    "DanaFaNum-ExtraBold": require("../assets/fonts/DanaFaNum-ExtraBold.ttf"),
    JetBrainsMono: require("../assets/fonts/JetBrainsMono.ttf"),
  });

  const [fontTimeout, setFontTimeout] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // تایمر اطمینان برای فونت‌ها تا در صورت تاخیر یا اشکال فونت‌ها، صفحه سیاه نماند
  useEffect(() => {
    const timer = setTimeout(() => {
      setFontTimeout(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const isReady = Boolean(loaded || error || fontTimeout);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  const courses = useCourseStore((state) => state.courses);
  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    if (isReady) {
      syncAllNotifications(courses);
    }
  }, [isReady, courses]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === "string") {
        Linking.openURL(url).catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? "#090a0f" : "#f5f7fa" },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
      <Toast config={toastConfig} topOffset={60} />
      {showCustomSplash && (
        <AnimatedSplash onFinish={() => setShowCustomSplash(false)} />
      )}
    </>
  );
}
