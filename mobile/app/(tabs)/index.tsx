import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { calculateDayStreak, getGreeting } from "@/utils/date";
import { ShiftCard } from "@/components/shift/shift-card";
import { useUserShifts } from "@/hooks/useUserShifts";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";
import { router } from "expo-router";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useUserAttendance } from "@/hooks/useUserAttendance";
import { bucket } from "@/app/(tabs)/schedule";

export default function HomeScreen() {
  const { user } = useAuth();
  const { shifts, eventsMap } = useUserShifts(user?.uid);
  const { colors } = useTheme();
  const { activeCheckIn, activeEvent } = useCheckIn(user?.uid);

  const { attendanceByShift, loading: attendanceLoading } = useUserAttendance(user?.uid);
  const { past, today, thisWeek, later } = useMemo(() => bucket(shifts), [shifts]);
  const greeting = useMemo(() => getGreeting(new Date()), []);
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container}>
      {/* Checked-in event banner */}
      {activeCheckIn && activeEvent && (
        <TouchableOpacity
          style={styles.checkedInBanner}
          onPress={() => router.push(`/event/${activeEvent.id}`)}
          activeOpacity={0.8}
        >
          <View style={styles.checkedInBannerLeft}>
            <IconSymbol
              size={20}
              name="checkmark.circle.fill"
              color={colors.tint}
            />
            <View>
              <Text style={styles.checkedInBannerLabel}>
                Currently Checked In
              </Text>
              <Text style={styles.checkedInBannerTitle}>
                {activeEvent.title}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.reportIncidentBtn}
            onPress={() => router.push("/(tabs)/incidents")}
          >
            <IconSymbol
              size={14}
              name="exclamationmark.triangle.fill"
              color="#FFFFFF"
            />
            <Text style={styles.reportIncidentBtnText}>Report</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Greeting + streak */}
      <View style={styles.streakContainer}>
        <View style={styles.textBlock}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{user?.displayName}!</Text>
        </View>
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={18} color="#EA580C" />
          <Text style={styles.streakText}>
            {calculateDayStreak(user?.lastActive || 0)} Day Streak
          </Text>
        </View>
      </View>

      {/* Quick actions — 3 items */}
      <View style={styles.quickActions}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/events")}
          >
            <IconSymbol size={28} name="magnifyingglass" color={colors.tint} />
            <ThemedText style={styles.actionText}>Volunteer</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/incidents")}
          >
            <IconSymbol
              size={28}
              name="exclamationmark.triangle.fill"
              color="#F97316"
            />
            <ThemedText style={styles.actionText}>Report Incident</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming schedule */}
      <View style={styles.section}>
        <View style={styles.scheduleGroup}>
          <Text style={styles.sectionLabel}>Today</Text>
          {today.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No shifts today</Text>
            </View>
          ) : (
            today.map((shift) => {
              const event = eventsMap[shift.eventId];
              if (!event) return null;
              return (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  event={event}
                  userId={user?.uid}
                />
              );
            })
          )}
        </View>

        <View style={styles.scheduleGroup}>
          <Text style={styles.sectionLabel}>This Week</Text>
          {thisWeek.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No shifts this week</Text>
            </View>
          ) : (
            thisWeek.map((shift) => {
              const event = eventsMap[shift.eventId];
              if (!event) return null;
              return (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  event={event}
                  userId={user?.uid}
                />
              );
            })
          )}
        </View>

        {later.length > 0 && (
          <View style={styles.scheduleGroup}>
            <Text style={styles.sectionLabel}>Later</Text>
            {later.map((shift) => {
              const event = eventsMap[shift.eventId];
              if (!event) return null;
              return (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  event={event}
                  userId={user?.uid}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Past shifts at the end — greyed out */}
      {past.length > 0 && (
        <View style={[styles.section, styles.pastSection]}>
          <Text style={styles.sectionLabel}>Previous Shifts</Text>
          <View style={styles.pastContent}>
            {past.map((shift) => {
              const event = eventsMap[shift.eventId];
              if (!event) return null;
              const attendanceRecord = attendanceByShift[shift.id];
              const attended = attendanceRecord?.status === "checked-out" || attendanceRecord?.status === "checked-in";
              return (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  event={event}
                  userId={user?.uid}
                  isPast
                  attended={attendanceLoading ? undefined : (attendanceRecord !== undefined ? attended : false)}
                  attendanceLoading={attendanceLoading}
                />
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceBackground,
    },
    checkedInBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primarySubtle,
      borderBottomWidth: 1,
      borderBottomColor: colors.primarySubtleBorder,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    checkedInBannerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    checkedInBannerLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.tint,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    checkedInBannerTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginTop: 1,
    },
    reportIncidentBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "#F97316",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
    },
    reportIncidentBtnText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },
    streakContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    textBlock: {
      flex: 1,
    },
    greeting: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    name: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    streakPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.streakPillBg,
      padding: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.streakPillBorder,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    streakText: {
      fontWeight: "700",
      color: "#EA580C",
    },
    quickActions: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionCard: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    actionText: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
    },
    section: {
      gap: 16,
      padding: 20,
      paddingTop: 0,
    },
    scheduleGroup: {
      paddingTop: 20,
      gap: 15,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    empty: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.emptyStateBg,
      borderRadius: 10,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
    pastSection: {
      paddingTop: 20,
      paddingBottom: 30,
    },
    pastContent: {
      opacity: 0.45,
      gap: 20
    },
  });
}
