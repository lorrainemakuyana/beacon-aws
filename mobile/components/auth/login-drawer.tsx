import { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  View,
} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Button from "../button";
import { useAuth } from "@/context/AuthContext";
import { validateLoginData } from "@/utils/validations";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";

export default function LoginDrawer({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const [email, setEmail] = useState(process.env.EXPO_PUBLIC_USEREMAIL || "");
  const [password, setPassword] = useState(process.env.EXPO_PUBLIC_USERPASSWORD || "");
  const { login, loginWithGoogle, resetPassword, loading } = useAuth();
  const { colors } = useTheme();

  const handleLogin = async () => {
    const validationError = validateLoginData({ email, password });
    if (validationError) {
      Alert.alert("Error", validationError);
      return;
    }

    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Google Sign-In Failed", error.message);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address first");
      return;
    }

    Alert.alert("Reset Password", `Send password reset email to ${email}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: async () => {
          try {
            await resetPassword(email);
            Alert.alert("Success", "Password reset email sent!");
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
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
        <ThemedText type="subtitle">Sign in to your account</ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email address</ThemedText>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
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
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            autoComplete="password"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <ThemedText style={styles.forgotPasswordText}>
            Forgot Password?
          </ThemedText>
        </TouchableOpacity>

        <Button
          text="Sign In"
          variant="primary"
          onPress={handleLogin}
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
          onPress={handleGoogleLogin}
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

        <View style={styles.signupPrompt}>
          <ThemedText>Don&apos;t have an account? </ThemedText>

          <TouchableOpacity onPress={onRegister} disabled={loading}>
            <ThemedText style={styles.signupLink}>Sign Up</ThemedText>
          </TouchableOpacity>
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
      marginBottom: 10,
    },
    form: {
      paddingTop: 20,
      gap: 20,
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
    forgotPassword: {
      alignSelf: "flex-end",
    },
    forgotPasswordText: {
      color: colors.tint,
      fontSize: 14,
      fontWeight: "500",
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
      padding: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      gap: 10,
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: "500",
    },
    signupPrompt: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    signupLink: {
      color: colors.tint,
      fontWeight: "600",
    },
  });
}
