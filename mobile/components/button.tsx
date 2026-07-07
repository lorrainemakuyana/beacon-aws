import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  text: string;
  variant?: ButtonVariant;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  asChild?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({
  text,
  variant = "primary",
  onPress,
  style,
  asChild,
  loading,
  disabled,
}: ButtonProps) {
  const { colors } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        isPrimary
          ? [styles.primaryButton, { backgroundColor: colors.primary }]
          : [styles.secondaryButton, { borderColor: colors.inputBorder }],
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          animating={true}
          color={isPrimary ? "#fff" : colors.textLabel}
        />
      )}
      <ThemedText
        style={isPrimary ? styles.primaryButtonText : [styles.secondaryButtonText, { color: colors.textLabel }]}
      >
        {text}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
