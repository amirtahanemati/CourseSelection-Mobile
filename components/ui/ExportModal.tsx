import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  FileJson,
  FileText,
  Image as ImageIcon,
  Share2,
  UploadCloud,
  X,
} from "lucide-react-native";
import { compressToEncodedURIComponent } from "lz-string";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Share,
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
  onExportImage?: () => Promise<void>;
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

  const executeWithDelay = (callback: () => Promise<void>) => {
    setIsProcessing(true);
    setTimeout(async () => {
      await callback();
    }, 150);
  };

  const handleShareLink = () => {
    if (courses.length === 0) {
      Toast.show({
        type: "error",
        text1: "برنامه‌ای برای اشتراک‌گذاری وجود ندارد.",
      });
      return;
    }

    executeWithDelay(async () => {
      try {
        const compressedData = compressToEncodedURIComponent(
          JSON.stringify(courses),
        );
        const shareUrl = `https://course-selection-rho.vercel.app/?schedule=${compressedData}`;

        await Share.share({
          message: `بیا برنامه‌ی هفتگی من رو ببین! 👇\n\n${shareUrl}`,
          title: "اشتراک‌گذاری برنامه هفتگی",
        });

        onClose();
      } catch (error) {
        Toast.show({ type: "error", text1: "خطا در اشتراک‌گذاری." });
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleExportJSON = () => {
    executeWithDelay(async () => {
      try {
        const jsonString = JSON.stringify(courses, null, 2);
        const FS = FileSystem as any;

        if (Platform.OS === "android") {
          try {
            const permissions =
              await FS.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const fileUri = await FS.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                `daneshjob_backup_${Date.now()}.json`,
                "application/json",
              );

              await FS.writeAsStringAsync(fileUri, jsonString, {
                encoding: FS.EncodingType.UTF8,
              });

              Toast.show({
                type: "success",
                text1: "فایل پشتیبان با موفقیت در دستگاه ذخیره شد.",
              });
              onClose();
              return;
            } else {
              return;
            }
          } catch (safError) {}
        }

        const tempUri = `${FS.documentDirectory}daneshjob_backup_${Date.now()}.json`;
        await FS.writeAsStringAsync(tempUri, jsonString, {
          encoding: FS.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempUri, {
            mimeType: "application/json",
            dialogTitle: "ذخیره فایل پشتیبان",
          });
        }
        onClose();
      } catch (error) {
        Toast.show({ type: "error", text1: "خطا در تهیه نسخه پشتیبان." });
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleImportJSON = () => {
    executeWithDelay(async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["application/json", "text/plain", "*/*"],
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          setIsProcessing(false);
          return;
        }

        const asset = result.assets ? result.assets[0] : (result as any);
        if (!asset || !asset.uri) throw new Error("Invalid URI");

        const uri = asset.uri;
        const FS = FileSystem as any;

        let fileContent = "";
        try {
          fileContent = await FS.readAsStringAsync(uri, {
            encoding: FS.EncodingType.UTF8,
          });
        } catch (fsError) {
          const response = await fetch(uri);
          fileContent = await response.text();
        }

        const parsedData = JSON.parse(fileContent);

        const isValid =
          Array.isArray(parsedData) &&
          parsedData.every(
            (item) => item.id && item.name && Array.isArray(item.sessions),
          );

        if (isValid) {
          importCourses(parsedData);
          Toast.show({
            type: "success",
            text1: "اطلاعات دروس با موفقیت بازیابی شد.",
          });
          onClose();
        } else {
          Toast.show({
            type: "error",
            text1: "ساختار فایل بکاپ نامعتبر است.",
          });
        }
      } catch (error) {
        Toast.show({ type: "error", text1: "خطا در خواندن یا پردازش فایل." });
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleExportPDF = () => {
    if (courses.length === 0) {
      Toast.show({
        type: "error",
        text1: "هیچ درسی برای خروجی گرفتن وجود ندارد.",
      });
      return;
    }

    executeWithDelay(async () => {
      try {
        const rows = courses
          .map((c) => {
            const sessionsStr = c.sessions
              .map(
                (s) =>
                  `<span class="badge badge-blue">${s.day} (${s.start} - ${s.end})</span>`,
              )
              .join(" ");

            const examStr = c.exam_date
              ? `<span class="badge badge-red">${c.exam_date} ساعت ${c.exam_time}</span>`
              : `<span class="badge badge-gray">بدون امتحان</span>`;

            return `
            <tr>
              <td>
                <div class="course-title">${c.name}</div>
                <div class="course-code">کد: ${c.code}</div>
              </td>
              <td>${c.professor || "-"}</td>
              <td><span class="badge badge-gray">${c.units} واحد</span></td>
              <td><div style="display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 4px;">${sessionsStr}</div></td>
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
              <style>
                @page { size: A4 landscape; margin: 10mm; }
                body {
                  font-family: Tahoma, Arial, sans-serif;
                  background-color: #ffffff;
                  color: #1e293b;
                  margin: 0;
                  padding: 20px;
                  direction: rtl;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 2px solid #f1f5f9;
                  padding-bottom: 15px;
                  margin-bottom: 25px;
                }
                .title h1 { margin: 0; font-size: 24px; color: #0f172a; }
                .title p { margin: 5px 0 0 0; font-size: 13px; color: #64748b; }
                .date { font-size: 14px; font-weight: bold; color: #3b82f6; background: #eff6ff; padding: 8px 16px; border-radius: 8px; }
                .table-container {
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  overflow: hidden;
                }
                table { width: 100%; border-collapse: collapse; text-align: right; font-size: 13px; }
                th, td { padding: 16px; border-bottom: 1px solid #e2e8f0; }
                th { background-color: #f8fafc; color: #475569; font-weight: bold; font-size: 13px; }
                tr:last-child td { border-bottom: none; }
                .course-title { font-size: 15px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
                .course-code { font-family: monospace; font-size: 12px; color: #64748b; }
                .badge { display: inline-block; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; margin: 2px; }
                .badge-blue { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
                .badge-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
                .badge-gray { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
                .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #0f172a; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">
                  <h1>برنامه کلاسی و امتحانات</h1>
                  <p>ابزار جامع انتخاب واحد</p>
                </div>
                <div class="date">${today}</div>
              </div>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th width="25%">مشخصات درس</th>
                      <th width="20%">نام استاد</th>
                      <th width="10%">تعداد واحد</th>
                      <th width="25%">زمان برگزاری جلسات</th>
                      <th width="20%">تاریخ و ساعت امتحان</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>
              </div>
              <div class="footer">تولید شده به صورت خودکار • ${today}</div>
            </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({ html, base64: false });

        if (Platform.OS === "android") {
          try {
            const FS = FileSystem as any;
            const permissions =
              await FS.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const pdfUri = await FS.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                `schedule_${Date.now()}.pdf`,
                "application/pdf",
              );
              const base64Data = await FS.readAsStringAsync(uri, {
                encoding: FS.EncodingType.Base64,
              });
              await FS.writeAsStringAsync(pdfUri, base64Data, {
                encoding: FS.EncodingType.Base64,
              });
              Toast.show({
                type: "success",
                text1: "فایل PDF با موفقیت در دستگاه ذخیره شد.",
              });
              onClose();
              return;
            } else {
              return;
            }
          } catch (safError) {}
        }

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: ".pdf",
            mimeType: "application/pdf",
          });
        }
        onClose();
      } catch (error) {
        Toast.show({ type: "error", text1: "خطا در تولید فایل PDF." });
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleExportPNG = () => {
    if (!onExportImage) return;
    executeWithDelay(async () => {
      try {
        await onExportImage();
        onClose();
      } catch (error) {
      } finally {
        setIsProcessing(false);
      }
    });
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
            className="pb-4"
          >
            <View
              className="w-16 h-1.5 rounded-full mb-4 mt-1"
              style={{ backgroundColor: isDark ? "#2a2d35" : "#e5e7eb" }}
            />
            <Text
              className={`text-[19px] font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
              style={{ writingDirection: "rtl", letterSpacing: 0 }}
            >
              مدیریت خروجی‌ها
            </Text>
          </View>

          <View className="flex-col gap-2.5 mb-6">
            <TouchableOpacity
              onPress={handleShareLink}
              disabled={isProcessing}
              className={`flex-row-reverse items-center py-1.5 px-4 gap-3 pb-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-11 h-11 rounded-full items-center justify-center bg-purple-500/10 shrink-0">
                <Share2 size={22} color="#a855f7" />
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className={`text-[15px] font-bold text-right mb-0.5 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  اشتراک‌گذاری برنامه
                </Text>
                <Text
                  className={`text-[11px] text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  ارسال مستقیم به دوستان از طریق لینک
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportPDF}
              disabled={isProcessing}
              className={`flex-row-reverse items-center py-1.5 px-4 gap-3 pb-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-11 h-11 rounded-full items-center justify-center bg-red-500/10 shrink-0">
                <FileText size={22} color="#ef4444" />
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className={`text-[15px] font-bold text-right mb-0.5 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  خروجی PDF
                </Text>
                <Text
                  className={`text-[11px] text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  ذخیره برنامه هفتگی به صورت فایل PDF
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportPNG}
              disabled={isProcessing}
              className={`flex-row-reverse items-center py-1.5 px-4 gap-3 pb-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-11 h-11 rounded-full items-center justify-center bg-blue-500/10 shrink-0">
                <ImageIcon size={22} color="#3b82f6" />
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className={`text-[15px] font-bold text-right mb-0.5 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  خروجی تصویر (PNG)
                </Text>
                <Text
                  className={`text-[11px] text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  ذخیره گرافیکی برنامه به صورت عکس
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportJSON}
              disabled={isProcessing}
              className={`flex-row-reverse items-center py-1.5 px-4 gap-3 pb-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-11 h-11 rounded-full items-center justify-center bg-amber-500/10 shrink-0">
                <FileJson size={22} color="#f59e0b" />
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className={`text-[15px] font-bold text-right mb-0.5 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  تهیه نسخه پشتیبان
                </Text>
                <Text
                  className={`text-[11px] text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  ذخیره اطلاعات دروس با فرمت JSON
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImportJSON}
              disabled={isProcessing}
              className={`flex-row-reverse items-center py-1.5 px-4 gap-3 pb-4 rounded-2xl border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-gray-50 border-gray-200"}`}
            >
              <View className="w-11 h-11 rounded-full items-center justify-center bg-emerald-500/10 shrink-0">
                <UploadCloud size={22} color="#10b981" />
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className={`text-[15px] font-bold text-right mb-0.5 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                >
                  بازیابی اطلاعات
                </Text>
                <Text
                  className={`text-[11px] text-right ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  بارگذاری فایل پشتیبان و بازیابی دروس
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleClose}
            className={`w-full py-4 rounded-2xl flex-row-reverse items-center justify-center border ${isDark ? "bg-[#1a1c23] border-[#272a35]" : "bg-white border-gray-200"}`}
          >
            {isProcessing ? (
              <Text className={`font-bold text-blue-500`}>
                در حال پردازش...
              </Text>
            ) : (
              <>
                <X size={20} color={isDark ? "#d1d5db" : "#4b5563"} />
                <Text
                  className={`font-bold ml-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  انصراف و بستن
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
