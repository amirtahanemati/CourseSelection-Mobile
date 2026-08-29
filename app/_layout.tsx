import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { I18nManager, Text, TextInput } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/ui/ToastConfig";

// غیرفعال کردن RTL نیتیو برای جلوگیری از باگ لمسی اندروید
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// اعمال فونت پیش‌فرض به تمام متن‌ها و اینپوت‌ها (ترفند React Native)
// @ts-ignore
if (Text.defaultProps == null) Text.defaultProps = {};
// @ts-ignore
Text.defaultProps.style = { fontFamily: "DanaFaNum" };
// @ts-ignore
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
// @ts-ignore
TextInput.defaultProps.style = { fontFamily: "DanaFaNum-Regular" };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "DanaFaNum-Regular": require("../assets/fonts/DanaFaNum-Regular.ttf"),
    "DanaFaNum-Bold": require("../assets/fonts/DanaFaNum-Bold.ttf"),
    "DanaFaNum-ExtraBold": require("../assets/fonts/DanaFaNum-ExtraBold.ttf"),
    JetBrainsMono: require("../assets/fonts/JetBrainsMono.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#090a0f" },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
      <Toast config={toastConfig} topOffset={60} />
    </>
  );
}
