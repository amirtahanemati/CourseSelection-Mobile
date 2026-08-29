import * as FileSystem from "expo-file-system/legacy";
import * as NavigationBar from "expo-navigation-bar";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useRef } from "react";
import { Dimensions, Platform, ScrollView, View } from "react-native";
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
import { buildExportFilename } from "../utils/helpers";

const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const { theme, courses } = useCourseStore();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const bgColor = isDark ? "#090a0f" : "#f5f7fa";
  const timelineRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync(bgColor);
      NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
    }
  }, [isDark, bgColor]);

  // 👈 تبدیل به تابع ناهمگام و بازگرداندن Promise برای مدیریت بستن مودال
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
                      buildExportFilename("weekly-schedule", "png"),
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
                  resolve(); // 👈 عملیات موفق، مودال می‌تواند بسته شود
                  return;
                } else {
                  // کاربر انتخاب پوشه را لغو کرده، پس مودال نباید بسته شود
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
      >
        <CourseForm />
        <MobileTimeline />

        <View className="flex-1 min-h-[40px]" />
        <Footer />
      </ScrollView>
    </View>
  );
}
