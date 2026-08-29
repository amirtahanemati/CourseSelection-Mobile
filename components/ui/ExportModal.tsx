import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  FileJson,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onExportImage?: () => void;
}

export default function ExportModal({
  visible,
  onClose,
  onExportImage,
}: Props) {
  const { theme, courses, importCourses } = useCourseStore();
  const isDark = theme === "dark";

  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 5 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.8) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 25,
            stiffness: 250,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 25,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleCloseAnimation();
    }
  }, [visible]);

  const handleCloseAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsVisible(false));
  };

  const handleClose = () => {
    if (!isProcessing) onClose();
  };

  const handleExportJSON = async () => {
    try {
      setIsProcessing(true);
      const jsonString = JSON.stringify(courses, null, 2);

      const FS = FileSystem as any;
      const fileUri = `${FS.cacheDirectory}courses_backup_${Date.now()}.json`;

      await FS.writeAsStringAsync(fileUri, jsonString, {
        encoding: FS.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "ذخیره فایل بکاپ انتخاب واحد",
        });
      }
      onClose();
    } catch (error) {
      Toast.show({ type: "error", text1: "خطا در تهیه نسخه پشتیبان." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportJSON = async () => {
    try {
      setIsProcessing(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        const FS = FileSystem as any;
        const fileContent = await FS.readAsStringAsync(uri, {
          encoding: FS.EncodingType.UTF8,
        });

        const parsedData = JSON.parse(fileContent);
        if (Array.isArray(parsedData)) {
          importCourses(parsedData);
          Toast.show({
            type: "success",
            text1: "اطلاعات با موفقیت بازیابی شد.",
          });
          onClose();
        } else {
          Toast.show({ type: "error", text1: "ساختار فایل بکاپ نامعتبر است." });
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "خطا در خواندن فایل. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsProcessing(true);
      if (courses.length === 0) {
        Toast.show({
          type: "error",
          text1: "هیچ درسی برای خروجی گرفتن وجود ندارد.",
        });
        setIsProcessing(false);
        return;
      }

      const rows = courses
        .map((c) => {
          const sessionsStr = c.sessions
            .map(
              (s) =>
                `<span class="badge badge-primary">${s.day} (${s.start} - ${s.end})</span>`,
            )
            .join(" ");

          const examStr = c.exam_date
            ? `<span class="badge badge-danger">${c.exam_date} ساعت ${c.exam_time}</span>`
            : `<span class="badge badge-neutral">بدون امتحان</span>`;

          return `
          <tr>
            <td>
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">${c.name}</div>
              <div style="font-family: monospace; color: #64748b; font-size: 12px;">کد: ${c.code}</div>
            </td>
            <td style="font-weight: 500;">${c.professor || "-"}</td>
            <td><span class="badge badge-outline">${c.units} واحد</span></td>
            <td><div style="display: flex; flex-wrap: wrap; gap: 4px;">${sessionsStr}</div></td>
            <td>${examStr}</td>
          </tr>
        `;
        })
        .join("");

      const today = new Date().toLocaleDateString("fa-IR");

      const html = `
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
            <style>
              body { 
                font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; 
                background-color: #f1f5f9; 
                padding: 40px; 
                color: #334155;
              }
              .container {
                background-color: #ffffff;
                border-radius: 20px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                padding: 35px 30px;
                text-align: center;
                color: white;
              }
              .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
              .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 300; }
              table { width: 100%; border-collapse: collapse; text-align: right; }
              th, td { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; }
              th { background-color: #f8fafc; color: #475569; font-size: 14px; font-weight: 700; }
              tr:last-child td { border-bottom: none; }
              tr:hover { background-color: #f8fafc; }
              
              .badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
              }
              .badge-primary { background-color: #eff6ff; color: #2563eb; }
              .badge-danger { background-color: #fef2f2; color: #dc2626; }
              .badge-neutral { background-color: #f1f5f9; color: #64748b; }
              .badge-outline { border: 1px solid #cbd5e1; color: #475569; }
              
              .footer {
                background-color: #f8fafc;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>برنامه کلاسی و امتحانات</h1>
                <p>تولید شده توسط ابزار جامع انتخاب واحد</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>مشخصات درس</th>
                    <th>نام استاد</th>
                    <th>تعداد واحد</th>
                    <th>زمان برگزاری جلسات</th>
                    <th>تاریخ و ساعت امتحان</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              <div class="footer">
                تهیه شده در تاریخ ${today}
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: "اشتراک‌گذاری برنامه PDF",
        });
      }
      onClose();
    } catch (error) {
      Toast.show({ type: "error", text1: "خطا در تولید فایل PDF." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPNG = () => {
    if (onExportImage) {
      onExportImage();
      onClose();
    } else {
      Toast.show({
        type: "info",
        text1: "قابلیت عکس‌برداری در حال فعال‌سازی است.",
      });
    }
  };

  if (!isVisible && !visible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: isDark ? 0.6 : 0.15,
            shadowRadius: 20,
            elevation: 30,
          }}
          className={`rounded-t-[32px] p-6 pb-10 w-full border-t ${isDark ? "bg-[#12141c] border-[#1f222a]" : "bg-white border-transparent"}`}
        >
          <View
            {...panResponder.panHandlers}
            style={{
              backgroundColor: "transparent",
              width: "100%",
              alignItems: "center",
            }}
            className="pb-6"
          >
            <View
              className="w-16 h-1.5 rounded-full mb-6 mt-1"
              style={{ backgroundColor: isDark ? "#2a2d35" : "#e5e7eb" }}
            />

            <Text
              className={`text-xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
              style={{ writingDirection: "rtl", letterSpacing: 0 }}
            >
              مدیریت خروجی‌ها
            </Text>
          </View>

          <View className="flex-col gap-3 mb-6">
            <TouchableOpacity
              onPress={handleExportPDF}
              disabled={isProcessing}
              className={`flex-row-reverse items-center p-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center bg-red-500/10 mr-4">
                <FileText size={24} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-base font-bold text-right mb-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  خروجی PDF
                </Text>
                <Text
                  className={`text-xs text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  تولید برنامه هفتگی در قالب جدول تمیز و زیبا
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportPNG}
              disabled={isProcessing}
              className={`flex-row-reverse items-center p-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center bg-blue-500/10 mr-4">
                <ImageIcon size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-base font-bold text-right mb-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  خروجی تصویر (PNG)
                </Text>
                <Text
                  className={`text-xs text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  عکس باکیفیت از گرافیک تایم‌لاین
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportJSON}
              disabled={isProcessing}
              className={`flex-row-reverse items-center p-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center bg-amber-500/10 mr-4">
                <FileJson size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-base font-bold text-right mb-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  تهیه نسخه پشتیبان
                </Text>
                <Text
                  className={`text-xs text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  ذخیره فایل دیتابیس با فرمت JSON
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImportJSON}
              disabled={isProcessing}
              className={`flex-row-reverse items-center p-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center bg-emerald-500/10 mr-4">
                <UploadCloud size={24} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-base font-bold text-right mb-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  بازیابی اطلاعات
                </Text>
                <Text
                  className={`text-xs text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  آپلود فایل بکاپ و جایگزینی کلاس‌ها
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleClose}
            className={`w-full py-4 rounded-2xl flex-row-reverse items-center justify-center border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
          >
            <X size={20} color={isDark ? "#d1d5db" : "#4b5563"} />
            <Text
              className={`font-bold ml-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              انصراف و بستن
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
