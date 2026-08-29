import * as FileSystem from "expo-file-system";
import * as NavigationBar from "expo-navigation-bar";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";

import ExportTimelineGrid from "../components/course/ExportTimelineGrid";
import MobileTimeline from "../components/course/MobileTimeline";
import CourseForm from "../components/form/CourseForm";
import Footer from "../components/layout/Footer";
import Topbar from "../components/layout/Topbar";
import WelcomeModal from "../components/ui/WelcomeModal";
import { useCourseStore } from "../store/useCourseStore";

const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const { theme, courses } = useCourseStore();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const bgColor = isDark ? "#090a0f" : "#f5f7fa";
  const timelineRef = useRef<ViewShot>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const bannerAnim = useRef(new Animated.Value(150)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync(bgColor);
      NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
    }
  }, [isDark, bgColor]);

  useEffect(() => {
    Animated.spring(bannerAnim, {
      toValue: 0,
      damping: 20,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isAtBottom ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isAtBottom]);

  // تابع بستن نوتیف با دکمه X
  const dismissBanner = () => {
    Animated.timing(bannerAnim, {
      toValue: 150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsBannerDismissed(true));
  };

  // محاسبه اسکرول کاربر برای تشخیص رسیدن به انتهای صفحه
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // اگر ۱۲۰ پیکسل مانده به انتها بود، یعنی به فوتر اصلی رسیده‌ایم
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;

    if (isBottom !== isAtBottom) {
      setIsAtBottom(isBottom);
    }
  };

  const handleCaptureTimeline = async (): Promise<void> => {
    if (courses.length === 0) {
      Toast.show({ type: "error", text1: "تایم‌لاین خالی است." });
      return Promise.reject(new Error("Empty timeline"));
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          if (timelineRef.current && timelineRef.current.capture) {
            const uri = await timelineRef.current.capture();

            if (Platform.OS === "android") {
              try {
                const FS = FileSystem as any;
                const permissions =
                  await FS.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                  const imgUri =
                    await FS.StorageAccessFramework.createFileAsync(
                      permissions.directoryUri,
                      `daneshjob_timeline_${Date.now()}.png`,
                      "image/png",
                    );
                  const base64Data = await FS.readAsStringAsync(uri, {
                    encoding: FS.EncodingType.Base64,
                  });
                  await FS.writeAsStringAsync(imgUri, base64Data, {
                    encoding: FS.EncodingType.Base64,
                  });

                  Toast.show({
                    type: "success",
                    text1: "تصویر با کیفیت در گوشی شما ذخیره شد.",
                  });
                  resolve();
                  return;
                } else {
                  reject(new Error("Canceled by user"));
                  return;
                }
              } catch (safError) {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, {
                    mimeType: "image/png",
                    dialogTitle: "ذخیره یا اشتراک تصویر",
                  });
                }
                resolve();
                return;
              }
            }

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri, {
                mimeType: "image/png",
                dialogTitle: "اشتراک‌گذاری تصویر برنامه",
              });
            }
            resolve();
          } else {
            reject(new Error("Capture failed"));
          }
        } catch (error) {
          Toast.show({ type: "error", text1: "خطا در تولید خروجی عکس." });
          reject(error);
        }
      }, 150);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <WelcomeModal />

      {/* لایه فوتر شناور (نوتیفیکیشن) */}
      {!isBannerDismissed && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: insets.bottom + 16,
            left: 16,
            right: 16,
            zIndex: 100,
            transform: [{ translateY: bannerAnim }],
            opacity: fadeAnim,
          }}
          pointerEvents={isAtBottom ? "none" : "auto"} // غیرفعال کردن کلیک وقتی محو شده
        >
          <Footer isFloating onClose={dismissBanner} />
        </Animated.View>
      )}

      {/* لایه مخفی برای تولید خروجی عکس با کیفیت */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: screenWidth + 1000,
          width: 3000,
          height: 3000,
          alignItems: "flex-start",
        }}
        pointerEvents="none"
      >
        <ViewShot
          ref={timelineRef}
          options={{ format: "png", quality: 1 }}
          style={{ backgroundColor: bgColor }}
        >
          <ExportTimelineGrid />
        </ViewShot>
      </View>

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

      <View
        className="absolute left-0 right-0 z-50 px-4"
        style={{ top: insets.top + 12 }}
        pointerEvents="box-none"
      >
        <Topbar onExportImage={handleCaptureTimeline} />
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingTop: insets.top + 90,
          paddingHorizontal: 16,
          paddingBottom: 32 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <CourseForm />
        <MobileTimeline />

        <View className="flex-1 min-h-[40px]" />

        {/* فوتر اصلی چسبیده به ته صفحه */}
        <Footer />
      </ScrollView>
    </View>
  );
}
