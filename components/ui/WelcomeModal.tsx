import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import {
  CalendarDays,
  Download,
  MessageSquareHeart,
  Palette,
  PenLine,
  Plus,
  Sparkles,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";
import { TelegramIcon } from "./SocialIcons";

const { height } = Dimensions.get("window");
const STORAGE_KEY = "hasSeenWelcome";

interface Section {
  key: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: string;
}

export default function WelcomeModal() {
  const isDark = useCourseStore((state) => state.theme) === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((hasSeen) => {
      if (!hasSeen) {
        setIsOpen(true);
        setIsVisible(true);
      }
    });
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleClose = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 40,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
      setIsVisible(false);
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 50) {
      setIsAtBottom(true);
    }
  };

  const sections: Section[] = [
    {
      key: "add",
      icon: <Plus size={22} color="#3b82f6" />,
      iconBg: "bg-blue-500/10 border-blue-500/20",
      title: "افزودن درس؛ هوشمند و ضد تداخل ➕",
      body: "از نوار بالا روی دکمه‌ی «افزودن» بزن. سیستم به قدری باهوشه که اگه ساعت کلاست با یه کلاس دیگه حتی یک دقیقه تداخل داشته باشه، مچت رو می‌گیره و اخطار می‌ده! 🕵️‍♂️✨",
    },
    {
      key: "timeline",
      icon: <CalendarDays size={22} color="#10b981" />,
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      title: "تایم‌لاین روزانه، مخصوص موبایل 📅",
      body: "برنامه‌ی هفتگیت به‌صورت یه تایم‌لاین عمودی و مرتب‌شده بر اساس روز نشون داده می‌شه؛ کافیه از تب‌های بالا روز مورد نظرت رو انتخاب کنی.",
    },
    {
      key: "edit",
      icon: <PenLine size={22} color="#f59e0b" />,
      iconBg: "bg-amber-500/10 border-amber-500/20",
      title: "مدیریت آسان؛ ویرایش و حذف ✏️",
      body: "روی هر درس که بزنی، اطلاعات کاملش توی یه پنل شیشه‌ای باز می‌شه. راحت ویرایشش کن یا حذفش کن؛ قبل از حذف قطعی حتماً ازت تاییدیه می‌گیریم تا زحماتت پاک نشه. 🛡️",
    },
    {
      key: "export",
      icon: <Download size={22} color="#6366f1" />,
      iconBg: "bg-indigo-500/10 border-indigo-500/20",
      title: "خروجی گرفتن و بکاپ 📸",
      body: "از منوی بالا روی دانلود بزن. می‌تونی از برنامه‌ات عکس (PNG) یا فایل PDF بگیری، یا از کل اطلاعاتت یه فایل پشتیبان (JSON) تهیه کنی تا هر وقت خواستی بازیابیش کنی. 🚀",
    },
    {
      key: "theme",
      icon: <Palette size={22} color="#ef4444" />,
      iconBg: "bg-red-500/10 border-red-500/20",
      title: "جادوی تم‌ها 🎨",
      body: "چشمات خسته شده؟ با دکمه‌ی تغییر تم، رنگ‌بندی اپ رو عوض کن؛ هم تم تاریک داریم هم روشن، هرکدوم رو که دوست داری انتخاب کن. 🌗",
    },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center px-4">
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnim,
          }}
        >
          <TouchableWithoutFeedback>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            maxHeight: height * 0.85,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDark ? 0.6 : 0.2,
            shadowRadius: 24,
            elevation: 35,
          }}
          className={`w-full rounded-[32px] overflow-hidden border ${
            isDark
              ? "bg-[#12141c] border-[#1f222a]"
              : "bg-white border-gray-200"
          }`}
        >
          <View
            className={`items-center pt-8 pb-5 border-b ${
              isDark ? "border-[#1f222a]" : "border-gray-100"
            }`}
          >
            <Text className="text-5xl pt-3">👋</Text>
            <Text
              className={`text-[17px] font-extrabold text-center px-4 leading-8 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              به راهنمای انتخاب واحد خوش اومدی! 🎉
            </Text>
          </View>

          <ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="px-5"
            contentContainerStyle={{ paddingVertical: 24, gap: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              className={`text-[14px] font-bold text-center leading-7 mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              سلام! اینجا همه‌چیز برای راحتی تو طراحی شده تا بدون سردرد یه
              برنامه‌ی هفتگی بی‌نقص بچینی. بیا سریع بهت بگم اپ چطور کار می‌کنه:
            </Text>

            {sections.map((s) => (
              <View key={s.key} className="flex-row-reverse gap-4">
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center border shrink-0 ${s.iconBg}`}
                >
                  {s.icon}
                </View>
                <View className="flex-1 justify-center">
                  <Text
                    className={`text-[15px] font-extrabold mb-1.5 text-right ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {s.title}
                  </Text>
                  <Text
                    className={`text-[13px] leading-6 text-right ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {s.body}
                  </Text>
                </View>
              </View>
            ))}

            <View
              className={`p-5 mt-2 rounded-2xl border items-center ${
                isDark
                  ? "bg-[#1a1c23] border-[#272a35]"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <MessageSquareHeart
                size={24}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text
                className={`text-[14px] font-extrabold text-center mt-3 mb-1 ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                پیشنهادی داری؟ باگی پیدا کردی؟ 🐞
              </Text>
              <Text
                className={`text-[12px] text-center leading-6 mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                از طریق تلگرام مستقیم بهم پیام بده:
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://t.me/nematidev").catch(() => {})
                }
                activeOpacity={0.8}
                className={`flex-row-reverse items-center justify-center gap-2 px-5 py-3 rounded-xl border w-full ${
                  isDark
                    ? "bg-[#12141c] border-[#272a35]"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text className="text-[13px] font-bold text-[#229ED9]">
                  @nematidev
                </Text>
                <TelegramIcon size={18} color="#229ED9" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View
            className={`p-5 border-t ${
              isDark
                ? "border-[#1f222a] bg-[#0f1117]"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.85}
              className={`w-full flex-row items-center justify-center py-4 rounded-2xl transition-colors duration-300 ${
                isAtBottom
                  ? "bg-blue-500"
                  : isDark
                    ? "bg-[#1f222a]"
                    : "bg-gray-200"
              }`}
            >
              {isAtBottom ? (
                <>
                  <Sparkles size={18} color="#fff" />
                  <Text className="text-white font-extrabold text-[15px] text-center mr-2">
                    باااشه دمت گرم!
                  </Text>
                </>
              ) : (
                <Text
                  className={`font-extrabold text-[15px] text-center ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  نخوندم بابا خودم بلدم 🙄
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
