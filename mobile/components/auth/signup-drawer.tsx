import {
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Button from "../button";
import { useAuth } from "@/context/AuthContext";
import { validateRegistrationData } from "@/utils/validations";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";

export default function SignupDrawer({ onLogin }: { onLogin: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register, loginWithGoogle, loading } = useAuth();
  const { colors } = useTheme();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const validationError = validateRegistrationData(formData);
    if (validationError) {
      Alert.alert("Error", validationError);
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
      );

      Alert.alert(
        "Success",
        "Registration successful! Please log in to continue.",
        [{ text: "OK", onPress: onLogin }],
      );
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Google Sign-Up Failed", error.message);
    }
  };

  const styles = getStyles(colors);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText type="subtitle">Create your account</ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.nameRow}>
          <View style={styles.nameInput}>
            <ThemedText style={styles.label}>First Name</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              placeholder="First name"
              placeholderTextColor={colors.textTertiary}
              autoComplete="given-name"
              editable={!loading}
            />
          </View>

          <View style={styles.nameInput}>
            <ThemedText style={styles.label}>Last Name</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
              placeholder="Last name"
              placeholderTextColor={colors.textTertiary}
              autoComplete="family-name"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email address</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Enter your email"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Password</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            placeholder="Create a password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            autoComplete="new-password"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Confirm Password</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange("confirmPassword", value)}
            placeholder="Confirm your password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            autoComplete="new-password"
            editable={!loading}
          />
        </View>

        <Button
          text="Register"
          variant="primary"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>OR</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleSignup}
          disabled={loading}
        >
          <IconSymbol size={20} name="globe" color={colors.tint} />
          <ThemedText style={styles.socialButtonText}>
            Continue with Google
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <IconSymbol size={20} name="apple.logo" color={colors.textPrimary} />
          <ThemedText style={styles.socialButtonText}>
            Continue with Apple
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.loginPrompt}>
          <ThemedText>Already have an account? </ThemedText>

          <TouchableOpacity onPress={onLogin} disabled={loading}>
            <ThemedText style={styles.loginLink}>Sign In</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.terms}>
          <ThemedText style={styles.termsText}>
            By creating an account, you agree to our{" "}
            <ThemedText style={styles.termsLink}>Terms of Service</ThemedText>{" "}
            and <ThemedText style={styles.termsLink}>Privacy Policy</ThemedText>
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.drawerBackground,
    },
    header: {
      alignItems: "center",
      gap: 15,
      marginBottom: 10,
    },
    form: {
      paddingTop: 20,
      gap: 20,
    },
    nameRow: {
      flexDirection: "row",
      gap: 15,
    },
    nameInput: {
      flex: 1,
      gap: 8,
    },
    inputGroup: {
      gap: 4,
    },
    label: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      padding: 16,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
      marginVertical: 5,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    socialButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      gap: 10,
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: "500",
    },
    loginPrompt: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    loginLink: {
      color: colors.tint,
      fontWeight: "600",
    },
    terms: {
      marginTop: 20,
      paddingHorizontal: 10,
    },
    termsText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
    termsLink: {
      color: colors.tint,
      fontWeight: "500",
    },
  });
}
