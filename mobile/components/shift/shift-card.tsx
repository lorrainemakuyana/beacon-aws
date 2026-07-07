import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Timestamp } from "firebase/firestore";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Shift, Event } from "@/interfaces";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";

type Props = {
  shift?: Shift;
  event: Event;
  userId?: string;
  isPast?: boolean;
  attended?: boolean;
  attendanceLoading?: boolean;
};

const STATUS_CONFIG: Record<
  Shift["status"],
  { label: string; bg: string; text: string }
> = {
  open: { label: "Open", bg: "#E8F0FE", text: "#1D4ED8" },
  full: { label: "Full", bg: "#F3F4F6", text: "#374151" },
  active: { label: "Active", bg: "#DCFCE7", text: "#166534" },
  completed: { label: "Completed", bg: "#E5E7EB", text: "#6B7280" },
  closed: { label: "Closed", bg: "#FEF2F2", text: "#991B1B" },
  attended: { label: "Attended", bg: "#F0FDF4", text: "#166534" },
  missed: { label: "Missed", bg: "#FEF3C7", text: "#92400E" },
};

const EVENT_STATUS_MAP: Record<string, Shift["status"]> = {
  draft: "closed",
  published: "open",
  active: "active",
  completed: "completed",
  cancelled: "closed",
};

const TIME_OPTS: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

function formatTimestampRange(start: Timestamp, end: Timestamp) {
  return `${start.toDate().toLocaleTimeString([], TIME_OPTS)} - ${end.toDate().toLocaleTimeString([], TIME_OPTS)}`;
}

function formatStringTimeRange(startTime: string, endTime: string) {
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString([], TIME_OPTS);
  };
  return `${fmt(startTime)} - ${fmt(endTime)}`;
}

function relativeDateLabel(date: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const ShiftCard = memo(function ShiftCard({
  shift,
  event,
  userId,
  isPast,
  attended,
  attendanceLoading,
}: Props) {
  const { colors } = useTheme();

  const effectiveStatus = useMemo((): Shift["status"] => {
    if (!shift) return EVENT_STATUS_MAP[event.status] ?? "open";
    if (!isPast) return shift.status;
    // Show neutral "closed" while attendance is still loading to avoid a false "Attended" flash
    if (attendanceLoading) return "closed";
    if (attended === true) return "attended";
    if (attended === false) return "missed";
    return "closed";
  }, [shift, event.status, isPast, attended, attendanceLoading]);

  const statusCfg = STATUS_CONFIG[effectiveStatus];

  const timeRange = useMemo(
    () =>
      shift
        ? formatTimestampRange(shift.timeSlot.start, shift.timeSlot.end)
        : formatStringTimeRange(event.startTime, event.endTime),
    [shift, event.startTime, event.endTime],
  );

  const computedDateLabel = useMemo(() => {
    const date = shift
      ? shift.timeSlot.start.toDate()
      : new Date(event.date + "T00:00:00");
    return relativeDateLabel(date);
  }, [shift, event.date]);

  const isToday = useMemo(() => {
    const now = new Date();
    if (shift) {
      const start = shift.timeSlot.start.toDate();
      const end = shift.timeSlot.end.toDate();
      const oneHourBefore = new Date(start.getTime() - 60 * 60 * 1000);
      return start.toDateString() === now.toDateString()
        && now >= oneHourBefore
        && now < end;
    }
    return new Date(event.date + "T00:00:00").toDateString() === now.toDateString();
  }, [shift, event.date]);

  const title = shift?.title ?? event.title;
  const roleText = shift?.role?.title ?? null;
  const styles = getStyles(colors);

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        shift ? router.push(`/shift/${shift.id}`) : router.push(`/event/${event.id}`)
      }
    >
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.badgeText, { color: statusCfg.text }]}>
            {statusCfg.label}
          </Text>
        </View>

        <Text style={styles.dot}>•</Text>
        <Text style={styles.dateText}>{computedDateLabel}</Text>

        <View style={styles.leafIcon}>
          <Ionicons name="information-circle-outline" size={20} color={colors.icon} />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.row}>
        <Feather name="clock" size={18} color={colors.icon} />
        <Text style={styles.secondaryText}>{timeRange}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={18} color={colors.icon} />
        <Text style={styles.secondaryText}>{event.location}</Text>
      </View>

      {roleText && (
        <View style={styles.row}>
          <Ionicons name="person-outline" size={18} color={colors.icon} />
          <Text style={styles.secondaryText}>
            Role: <Text style={styles.roleStrong}>{roleText}</Text>
          </Text>
        </View>
      )}

      {isToday && shift && (
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={(e) => {
            e.stopPropagation?.();
            router.push("/(tabs)/check-in");
          }}
        >
          <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
          <Text style={styles.checkInButtonText}>Check-In Now</Text>
        </TouchableOpacity>
      )}
    </Pressable>
  );
});

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 16,
    },
    checkInButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 10,
      marginTop: 8,
    },
    checkInButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 15,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeText: {
      fontWeight: "600",
      fontSize: 14,
    },
    dot: {
      marginHorizontal: 8,
      color: colors.icon,
      fontSize: 18,
    },
    dateText: {
      color: colors.icon,
      fontSize: 16,
      flex: 1,
    },
    leafIcon: {
      backgroundColor: colors.emptyStateBg,
      padding: 10,
      borderRadius: 14,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    secondaryText: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    roleStrong: {
      color: colors.textPrimary,
      fontWeight: "400",
    },
  });
}
