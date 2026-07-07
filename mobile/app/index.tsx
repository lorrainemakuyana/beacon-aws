import { useEffect } from "react";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/assets/images/logo.png";
import { Dimensions, Image } from "react-native";

const width = Dimensions.get("window").width;

export default function IndexScreen() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait until auth initialization finishes, then route accordingly
    if (loading) return;

    if (isAuthenticated) {
      // User signed in -> go to main app (tabs)
      router.replace("/(tabs)");
    } else {
      // Not signed in -> go to auth flow
      router.replace("/auth");
    }
  }, [loading, isAuthenticated]);

  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      {/* // use logo */}
      <Image
        source={Logo}
        style={{ width: width * 0.5, height: width * 0.5 }}
      />
    </ThemedView>
  );
}
