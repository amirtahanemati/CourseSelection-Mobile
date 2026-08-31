import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useCourseStore } from "../../store/useCourseStore";
import Text from "./CustomText";
import Logo from "./Logo";

const { width, height } = Dimensions.get("window");

interface Props {
  onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: Props) {
  const theme = useCourseStore((state) => state.theme);
  const isDark = theme === "dark";

  const bgColor = isDark ? "#090a0f" : "#f5f7fa";
  const glowColor = isDark ? "#1877f2" : "#5b8def";

  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(8)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 12,
          stiffness: 140,
          mass: 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(420),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: bgColor, opacity: overlayOpacity, zIndex: 999 },
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: height / 2 - 260,
          left: width / 2 - 260,
          opacity: glowOpacity,
        }}
      >
        <Svg width={520} height={520}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop
                offset="0%"
                stopColor={glowColor}
                stopOpacity={isDark ? 0.35 : 0.25}
              />
              <Stop offset="100%" stopColor={glowColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={260} cy={260} r={260} fill="url(#glow)" />
        </Svg>
      </Animated.View>

      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <View
            style={[
              styles.logoBadge,
              {
                backgroundColor: isDark
                  ? "rgba(24,119,242,0.12)"
                  : "rgba(24,119,242,0.08)",
                borderColor: isDark
                  ? "rgba(24,119,242,0.25)"
                  : "rgba(24,119,242,0.18)",
              },
            ]}
          >
            <Logo width={56} height={56} />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
            alignItems: "center",
            marginTop: 22,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: isDark ? "#ffffff" : "#111827",
            }}
          >
            ابزار انتخاب واحد
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              marginTop: 6,
              color: isDark ? "#6b7280" : "#9ca3af",
            }}
          >
            برنامه‌ریزی هوشمند ترم تحصیلی
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
