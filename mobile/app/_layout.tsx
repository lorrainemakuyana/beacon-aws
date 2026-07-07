import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { ThemePreferenceProvider, useTheme } from "@/context/ThemeContext";
import { GlobalLoader } from "@/components/global-loader";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutInner() {
  const { effectiveColorScheme } = useTheme();

  return (
    <ThemeProvider value={effectiveColorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <LoadingProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="auth/index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="shift/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <GlobalLoader />
          <StatusBar style={effectiveColorScheme === "dark" ? "light" : "dark"} />
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutInner />
    </ThemePreferenceProvider>
  );
}
