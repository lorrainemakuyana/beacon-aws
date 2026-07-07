import { StyleSheet, ScrollView, TouchableOpacity, View, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme, ThemePreference } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function ProfileScreen() {
  const { colors, themePreference, setThemePreference } = useTheme();
  const { logout } = useAuth();
  const styles = getStyles(colors);

  async function handleSignOut() {
    try {
      await logout();
      router.replace("/auth");
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.profileImageContainer}>
          <IconSymbol size={38} name="person.fill" color="#FFFFFF" />
        </View>
        <ThemedText type="title" style={styles.profileName}>John Volunteer</ThemedText>
        <ThemedText type="subtitle" style={styles.profileSubtitle}>Volunteer since 2024</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.statsSection}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Events</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>48</ThemedText>
            <ThemedText style={styles.statLabel}>Hours</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>5</ThemedText>
            <ThemedText style={styles.statLabel}>Orgs</ThemedText>
          </View>
        </ThemedView>

        {/* Theme selector */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Appearance</ThemedText>
          <View style={styles.themeSelector}>
            {THEME_OPTIONS.map((opt) => {
              const active = themePreference === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => setThemePreference(opt.value)}
                >
                  <ThemedText
                    style={[
                      styles.themeOptionText,
                      active && styles.themeOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Account</ThemedText>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol size={20} name="person.circle" color={colors.icon} />
              <ThemedText style={styles.menuText}>Edit Profile</ThemedText>
              <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol size={20} name="bell" color={colors.icon} />
              <ThemedText style={styles.menuText}>Notifications</ThemedText>
              <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
              <IconSymbol size={20} name="shield" color={colors.icon} />
              <ThemedText style={styles.menuText}>Privacy & Security</ThemedText>
              <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Support</ThemedText>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol size={20} name="questionmark.circle" color={colors.icon} />
              <ThemedText style={styles.menuText}>Help Center</ThemedText>
              <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
              <IconSymbol size={20} name="envelope" color={colors.icon} />
              <ThemedText style={styles.menuText}>Contact Us</ThemedText>
              <IconSymbol size={16} name="chevron.right" color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <IconSymbol size={20} name="arrow.right.square" color={colors.danger} />
            <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 20,
      paddingTop: 20,
      alignItems: "center",
      gap: 10,
    },
    profileImageContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.profileAvatar,
      justifyContent: "center",
      alignItems: "center",
    },
    profileName: {
      fontSize: 20,
      lineHeight: 28,
    },
    profileSubtitle: {
      fontSize: 14,
      fontWeight: "500",
    },
    content: {
      padding: 20,
      gap: 25,
    },
    statsSection: {
      flexDirection: "row",
      gap: 15,
    },
    statCard: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.tint,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    section: {
      gap: 15,
    },
    themeSelector: {
      flexDirection: "row",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    themeOption: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      backgroundColor: colors.cardBackground,
    },
    themeOptionActive: {
      backgroundColor: colors.primary,
    },
    themeOptionText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    themeOptionTextActive: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    menuList: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      gap: 10,
      backgroundColor: colors.dangerSubtle,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      borderRadius: 12,
    },
    logoutText: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
