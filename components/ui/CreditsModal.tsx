import * as Linking from "expo-linking";
import { Gift, Globe, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TelegramIcon,
} from "./SocialIcons";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface SocialLink {
  key: string;
  icon: React.ReactNode;
  url: string;
  activeColor: string;
}

export default function CreditsModal({ visible, onClose }: Props) {
  const isDark = useCourseStore((state) => state.theme) === "dark";
  const insets = useSafeAreaInsets();

  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 5 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
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

  const handleClose = () => onClose();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const mobileDevLinks: SocialLink[] = [
    {
      key: "github",
      icon: <GithubIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://github.com/amirtahanemati",
      activeColor: isDark ? "#fff" : "#111827",
    },
    {
      key: "linkedin",
      icon: <LinkedinIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://www.linkedin.com/in/amirtahanemati",
      activeColor: "#0A66C2",
    },
    {
      key: "instagram",
      icon: <InstagramIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://instagram.com/amirtahanemati",
      activeColor: "#E1306C",
    },
    {
      key: "telegram",
      icon: <TelegramIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://t.me/nematidev",
      activeColor: "#229ED9",
    },
  ];

  const webDevLinks: SocialLink[] = [
    {
      key: "github",
      icon: <GithubIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://github.com/ItsReZNuM",
      activeColor: isDark ? "#fff" : "#111827",
    },
    {
      key: "linkedin",
      icon: <LinkedinIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://www.linkedin.com/in/reza-mohamadnia-73728834b/",
      activeColor: "#0A66C2",
    },
    {
      key: "instagram",
      icon: <InstagramIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://www.instagram.com/itsreznum/",
      activeColor: "#E1306C",
    },
    {
      key: "telegram",
      icon: <TelegramIcon size={18} color={isDark ? "#9ca3af" : "#6b7280"} />,
      url: "https://t.me/ItsReZNuM",
      activeColor: "#229ED9",
    },
  ];

  const renderIconRow = (links: SocialLink[]) => (
    <View className="flex-row items-center justify-center gap-3 mt-3">
      {links.map((l) => (
        <TouchableOpacity
          key={l.key}
          onPress={() => openLink(l.url)}
          activeOpacity={0.7}
          className={`w-10 h-10 rounded-xl items-center justify-center border ${
            isDark
              ? "bg-[#12141c] border-[#272a35]"
              : "bg-white border-gray-200"
          }`}
        >
          {l.icon}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!isVisible && !visible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
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
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: isDark ? 0.6 : 0.15,
            shadowRadius: 20,
            elevation: 30,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          className={`rounded-t-[32px] p-6 w-full border-t ${
            isDark
              ? "bg-[#12141c] border-[#1f222a]"
              : "bg-white border-transparent"
          }`}
        >
          <View {...panResponder.panHandlers} className="items-center pb-2">
            <View
              className={`w-16 h-1.5 rounded-full mb-6 mt-1 ${
                isDark ? "bg-[#2a2d35]" : "bg-gray-200"
              }`}
            />
            <Text
              className={`text-xl font-extrabold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              درباره‌ی این اپ
            </Text>
          </View>

          {/* توسعه‌دهنده نسخه موبایل */}
          <View
            className={`rounded-2xl border p-5 items-center mb-4 ${
              isDark
                ? "bg-[#1a1c23] border-[#272a35]"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Text
              className={`text-[11px] font-bold mb-1 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              توسعه‌ی نسخه‌ی اپلیکیشن موبایل
            </Text>
            <Text
              className={`text-base font-extrabold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              امیرطاها نعمتی
            </Text>
            {renderIconRow(mobileDevLinks)}

            <TouchableOpacity
              onPress={() => openLink("https://daramet.com/Tahanemati")}
              activeOpacity={0.85}
              className="flex-row-reverse items-center justify-center gap-2 mt-5 w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <Gift size={16} color="#ef4444" />
              <Text className="text-sm font-extrabold text-red-500">
                حمایت مالی از این پروژه
              </Text>
            </TouchableOpacity>
          </View>

          {/* توسعه‌دهنده نسخه وب */}
          <View
            className={`rounded-2xl border p-5 items-center ${
              isDark
                ? "bg-[#1a1c23] border-[#272a35]"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Text
              className={`text-[11px] font-bold mb-1 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              طراحی و توسعه‌ی نسخه‌ی وب
            </Text>
            <Text
              className={`text-base font-extrabold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              رضا محمدنیا
            </Text>
            {renderIconRow(webDevLinks)}

            <TouchableOpacity
              onPress={() =>
                openLink("https://course-selection-rho.vercel.app/")
              }
              activeOpacity={0.85}
              className={`flex-row-reverse items-center justify-center gap-2 mt-5 w-full py-3 rounded-xl border ${
                isDark
                  ? "bg-[#12141c] border-[#1e3a8a]"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <Globe size={16} color={isDark ? "#60a5fa" : "#3b82f6"} />
              <Text
                className={`text-sm font-extrabold ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                مشاهده و استفاده از نسخه وب
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleClose}
            className={`w-full mt-6 py-4 rounded-2xl flex-row-reverse items-center justify-center border ${
              isDark
                ? "bg-[#1a1c23] border-[#272a35]"
                : "bg-white border-gray-200"
            }`}
          >
            <X size={20} color={isDark ? "#d1d5db" : "#4b5563"} />
            <Text
              className={`font-bold ml-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              بستن
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
