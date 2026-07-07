import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";

const { height } = Dimensions.get("window");
const DRAWER_HEIGHT = height * 0.8;
const CLOSE_THRESHOLD = DRAWER_HEIGHT * 0.25;

type BottomDrawerProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomDrawer({
  visible,
  onClose,
  children,
}: BottomDrawerProps) {
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const { colors } = useTheme();

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, DRAWER_HEIGHT],
    outputRange: [0.4, 0],
    extrapolate: "clamp",
  });

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.timing(translateY, {
      toValue: visible ? 0 : DRAWER_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    });
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !keyboardOpen && gesture.dy > 5,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > CLOSE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: DRAWER_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: colors.drawerBackground, transform: [{ translateY }] },
        ]}
      >
        <Animated.View
          {...(!keyboardOpen ? panResponder.panHandlers : {})}
          style={styles.handleContainer}
        >
          <View style={[styles.handle, { backgroundColor: colors.drawerHandle }]} />
        </Animated.View>

        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,1)",
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    height: DRAWER_HEIGHT,
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  handleContainer: {
    paddingBottom: 12,
    alignItems: "center",
  },
});
