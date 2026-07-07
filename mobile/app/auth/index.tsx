import { StyleSheet, View, Image } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BottomDrawer } from "@/components/auth/bottom-drawer";
import LoginDrawer from "@/components/auth/login-drawer";
import SignupDrawer from "@/components/auth/signup-drawer";
import Logo from "@/assets/images/logo.png";
import Button from "@/components/button";
import { useTheme } from "@/context/ThemeContext";

export default function WelcomeScreen() {
  const [drawer, setDrawer] = useState<"login" | "signup" | null>(null);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} />
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            Beacon
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.features}>
          <ThemedView style={styles.feature}>
            <IconSymbol size={40} name="calendar.badge.plus" color={colors.tint} />
            <ThemedView style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Find Events</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Discover volunteer opportunities that match your interests and schedule
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.feature}>
            <IconSymbol size={40} name="qrcode" color={colors.tint} />
            <ThemedView style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Easy Check-In</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Quick QR code scanning or manual check-in for your volunteer shifts
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.feature}>
            <IconSymbol size={40} name="clock" color={colors.tint} />
            <ThemedView style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Track Hours</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Keep track of your volunteer hours and see your impact over time
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.feature}>
            <IconSymbol size={40} name="bell.fill" color={colors.tint} />
            <ThemedView style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Stay Connected</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Get notifications about new events, upcoming shifts and important updates
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.actions}>
          <Button
            asChild
            onPress={() => setDrawer("signup")}
            variant="primary"
            text="Get Started"
          />
          <Button
            onPress={() => setDrawer("login")}
            variant="secondary"
            text="I already have an account"
          />
        </ThemedView>
        <BottomDrawer visible={drawer !== null} onClose={() => setDrawer(null)}>
          {drawer === "signup" && (
            <SignupDrawer onLogin={() => setDrawer("login")} />
          )}

          {drawer === "login" && (
            <LoginDrawer onRegister={() => setDrawer("signup")} />
          )}
        </BottomDrawer>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 80,
    gap: 40,
  },
  header: {
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
  },
  featureText: {
    flex: 1,
    gap: 5,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 15,
  },
});
