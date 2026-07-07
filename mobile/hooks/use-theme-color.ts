import { Colors, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
) {
  const { effectiveColorScheme } = useTheme();
  const colorFromProps = props[effectiveColorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[effectiveColorScheme][colorName];
}
