import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useCheckIn } from "@/hooks/useCheckIn";

type Tab = "qr" | "code";

export default function CheckInScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { activeCheckIn, activeEvent, loading, submitting, handleCheckIn, handleCheckOut } =
    useCheckIn(user?.uid);

  const [activeTab, setActiveTab] = useState<Tab>("qr");
  const [code, setCode] = useState("");

  const styles = getStyles(colors);

  const onSubmitCode = async () => {
    if (!code.trim()) {
      Alert.alert("Enter a code", "Please enter the event passphrase.");
      return;
    }
    try {
      await handleCheckIn(code);
      setCode("");
      Alert.alert("Checked in!", `You are now checked in to ${activeEvent?.title ?? "the event"}.`);
    } catch (e: any) {
      Alert.alert("Check-in failed", e.message);
    }
  };

  const onCheckOut = async () => {
    Alert.alert("Check Out", "Are you sure you want to check out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Check Out",
        style: "destructive",
        onPress: async () => {
          try {
            await handleCheckOut();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  // Already checked in — only show status + checkout
  if (activeCheckIn) {
    return (
      <View style={styles.container}>
        <View style={styles.checkedInSection}>
          <View style={styles.checkedInIcon}>
            <IconSymbol size={48} name="checkmark.circle.fill" color={colors.tint} />
          </View>
          <ThemedText type="subtitle" style={styles.checkedInTitle}>
            You&apos;re checked in
          </ThemedText>
          {activeEvent && (
            <ThemedText style={styles.checkedInEvent}>{activeEvent.title}</ThemedText>
          )}
          <ThemedText style={styles.checkedInTime}>
            Since {new Date(activeCheckIn.checkIn.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ThemedText>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.checkOutButton}
            onPress={onCheckOut}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <>
                <IconSymbol size={24} name="location" color={colors.danger} />
                <ThemedText style={styles.checkOutButtonText}>Check Out</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Not checked in — show tab UI
  return (
    <View style={styles.container}>
      {/* Tab selector */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "qr" && styles.tabActive]}
          onPress={() => setActiveTab("qr")}
        >
          <IconSymbol
            size={16}
            name="qrcode"
            color={activeTab === "qr" ? "#FFFFFF" : colors.textSecondary}
          />
          <ThemedText style={[styles.tabText, activeTab === "qr" && styles.tabTextActive]}>
            QR Code
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "code" && styles.tabActive]}
          onPress={() => setActiveTab("code")}
        >
          <IconSymbol
            size={16}
            name="keyboard"
            color={activeTab === "code" ? "#FFFFFF" : colors.textSecondary}
          />
          <ThemedText style={[styles.tabText, activeTab === "code" && styles.tabTextActive]}>
            Enter Code
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {activeTab === "qr" ? (
        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <IconSymbol size={80} name="qrcode" color={colors.tint} />
            <ThemedText type="subtitle">QR Code Scanner</ThemedText>
            <ThemedText style={styles.qrSubtext}>
              Point your camera at the event QR code
            </ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.codeSection}>
          <ThemedText style={styles.codeLabel}>Event Passphrase</ThemedText>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            placeholder="Enter the event code"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
            onSubmitEditing={onSubmitCode}
            returnKeyType="go"
          />
          <ThemedText style={styles.codeHint}>
            Ask your event coordinator for the passphrase.
          </ThemedText>

          <TouchableOpacity
            style={[styles.checkInButton, submitting && styles.buttonDisabled]}
            onPress={onSubmitCode}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol size={20} name="arrow.right.circle.fill" color="#FFFFFF" />
                <ThemedText style={styles.checkInButtonText}>Check In</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Status */}
      <View style={styles.bottom}>
        <View style={styles.statusCard}>
          <IconSymbol size={16} name="info.circle" color={colors.textTertiary} />
          <ThemedText style={styles.statusText}>
            Not currently checked in to any shift
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    tabs: {
      flexDirection: "row",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 24,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: "#FFFFFF",
    },
    qrSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    qrPlaceholder: {
      width: 260,
      height: 260,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.tint,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
    },
    qrSubtext: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
    },
    codeSection: {
      flex: 1,
      gap: 12,
    },
    codeLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    codeInput: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      padding: 16,
      fontSize: 18,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
      letterSpacing: 2,
    },
    codeHint: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    checkInButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      gap: 10,
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    checkInButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    bottom: {
      paddingBottom: 10,
    },
    statusCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 16,
      backgroundColor: colors.emptyStateBg,
      borderRadius: 10,
    },
    statusText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    checkedInSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    checkedInIcon: {
      marginBottom: 8,
    },
    checkedInTitle: {
      textAlign: "center",
    },
    checkedInEvent: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    checkedInTime: {
      fontSize: 14,
      color: colors.textTertiary,
    },
    checkOutButton: {
      backgroundColor: colors.cardBackground,
      borderWidth: 2,
      borderColor: colors.danger,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      gap: 10,
    },
    checkOutButtonText: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
