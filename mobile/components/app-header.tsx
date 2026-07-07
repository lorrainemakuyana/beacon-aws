import { StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSegments } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/assets/images/logo.png";

const SUBTITLES: Record<string, string> = {
  index: "Your volunteer hub",
  events: "Events",
  schedule: "My schedule",
  "check-in": "Check in",
  incidents: "Incidents",
  profile: "Your account",
};

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { colors } = useTheme();

  const screen = segments[segments.length - 1] ?? "index";
  const subtitle = SUBTITLES[screen] ?? "Your volunteer hub";

  return (
    <ThemedView style={[styles.header, { paddingTop: insets.top + 5, borderBottomColor: colors.headerBorder }]}>
      <Image source={Logo} style={[styles.logo, { borderColor: colors.border }]} />
      <ThemedText type="subtitle">{subtitle}</ThemedText>
    </ThemedView>
  );
}

export function useHeaderHeight() {
  const insets = useSafeAreaInsets();
  return insets.top + 71;
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  logo: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
});
