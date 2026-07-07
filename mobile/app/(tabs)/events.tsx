import { useState, useMemo } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShiftCard } from "@/components/shift/shift-card";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { useAuth } from "@/context/AuthContext";
import { useUserShifts } from "@/hooks/useUserShifts";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";

export default function EventsScreen() {
  const { user } = useAuth();
  const { events } = useUpcomingEvents();
  const { shifts } = useUserShifts(user?.uid);
  const [query, setQuery] = useState("");
  const { colors } = useTheme();

  const filtered = useMemo(() => {
    if (!query.trim()) return events;
    const lower = query.toLowerCase();
    return events.filter((e) => e.title.toLowerCase().includes(lower));
  }, [events, query]);

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Sticky search bar — always open */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        ) : (
          filtered.map((event) => {
            const shift = shifts.find((s) => s.eventId === event.id);
            return (
              <ShiftCard
                key={event.id}
                event={event}
                shift={shift}
                userId={user?.uid}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceBackground,
    },
    searchHeader: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.surfaceBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
    },
    scroll: {
      flex: 1,
    },
    list: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 30,
      gap: 12,
    },
    empty: {
      paddingVertical: 40,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 15,
      color: colors.textTertiary,
    },
  });
}
