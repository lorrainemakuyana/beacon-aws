import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore";

import { Shift } from "@/interfaces";
import { ThemedText } from "@/components/themed-text";
import { useShiftDetail } from "@/hooks/useShiftDetail";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useCheckIn } from "@/hooks/useCheckIn";

const STATUS_CONFIG: Record<
  Shift["status"],
  { label: string; bg: string; text: string }
> = {
  open: { label: "Open", bg: "#E8F0FE", text: "#1D4ED8" },
  full: { label: "Full", bg: "#F3F4F6", text: "#374151" },
  active: { label: "Confirmed", bg: "#DCFCE7", text: "#166534" },
  completed: { label: "Completed", bg: "#E5E7EB", text: "#6B7280" },
  closed: { label: "Closed", bg: "#FEF2F2", text: "#991B1B" },
  attended: { label: "Attended", bg: "#F0FDF4", text: "#166534" },
  missed: { label: "Missed", bg: "#FEF3C7", text: "#92400E" },
};

const AVATAR_PALETTES = [
  { bg: "#DCFCE7", fg: "#166534" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#FCE7F3", fg: "#9D174D" },
  { bg: "#E0F2FE", fg: "#0C4A6E" },
  { bg: "#F3E8FF", fg: "#6B21A8" },
];

function randomPalette() {
  return AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)];
}

function formatDetailDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatted = date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (date.toDateString() === today.toDateString())
    return `Today, ${date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
  if (date.toDateString() === tomorrow.toDateString())
    return `Tomorrow, ${date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
  return formatted;
}

function formatTimeRange(start: Timestamp, end: Timestamp): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${start.toDate().toLocaleTimeString([], opts)} - ${end.toDate().toLocaleTimeString([], opts)}`;
}

function getDuration(start: Timestamp, end: Timestamp): string {
  const hours = (end.toMillis() - start.toMillis()) / (1000 * 60 * 60);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export default function ShiftDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shift, event, teamUsers } = useShiftDetail(id ?? "");
  const { colors } = useTheme();
  const { user } = useAuth();
  const { activeCheckIn } = useCheckIn(user?.uid);

  const styles = getStyles(colors);

  if (!shift || !event) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>Shift not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[shift.status];
  const timeRange = formatTimeRange(shift.timeSlot.start, shift.timeSlot.end);
  const duration = getDuration(shift.timeSlot.start, shift.timeSlot.end);
  const dateLabel = formatDetailDate(shift.timeSlot.start.toDate());
  const roleTitle = shift.role?.title ?? "Volunteer";
  const tasks = shift.tasks ?? [];
  const now = new Date();
  const shiftStart = shift.timeSlot.start.toDate();
  const shiftEnd = shift.timeSlot.end.toDate();
  const oneHourBefore = new Date(shiftStart.getTime() - 60 * 60 * 1000);
  const isToday = shiftStart.toDateString() === now.toDateString()
    && now >= oneHourBefore
    && now < shiftEnd;
  const isPast = now > shiftEnd;
  const hasStarted = now >= shiftStart;
  const teamMembers = teamUsers.map((user) => {
    const palette = randomPalette();
    return {
      uid: user.uid,
      name: user.displayName,
      initial: user.displayName.charAt(0).toUpperCase(),
      ...palette,
    };
  });
  const teamCount = teamMembers.length;

  function handleGetDirections() {
    const query = encodeURIComponent(`${event!.location}, ${event!.address ?? ""}`);
    const url = Platform.OS === "ios"
      ? `https://maps.apple.com/?q=${query}`
      : `https://maps.google.com/?q=${query}`;
    Linking.openURL(url);
  }

  function handleCall() {
    if (event?.organizer?.phone) {
      Linking.openURL(`tel:${event.organizer.phone.replace(/\s/g, "")}`);
    }
  }

  function handleEmail() {
    if (event?.organizer?.email) {
      Linking.openURL(`mailto:${event.organizer.email}`);
    }
  }

  function handleCancelShift() {
    Alert.alert(
      "Cancel Shift",
      "Are you sure you want to cancel this shift? This action cannot be undone.",
      [
        { text: "Keep Shift", style: "cancel" },
        { text: "Cancel Shift", style: "destructive", onPress: () => router.back() },
      ],
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Shift Details</ThemedText>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.eventCardHeader}>
            <View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.badgeText, { color: statusCfg.text }]}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>
            <View style={styles.eventIcon}>
              <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.icon} />
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.squareIcon}>
              <Ionicons name="calendar-outline" size={24} color={colors.icon} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{dateLabel}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.squareIcon}>
              <Feather name="clock" size={24} color={colors.icon} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{timeRange}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.card}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={30} color={colors.primary} />
            <View style={styles.locationText}>
              <Text style={styles.locationName}>{event.location}</Text>
              {event.address && (
                <Text style={styles.locationAddress}>{event.address}</Text>
              )}
            </View>
          </View>

          <View style={styles.mapPlaceholder}>
            <Ionicons name="image-outline" size={36} color={colors.textTertiary} />
          </View>

          <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
            <Feather name="navigation" size={16} color={colors.textLabel} />
            <Text style={styles.directionsBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Shift Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={24} color={colors.icon} />
            <View>
              <Text style={styles.infoLabel}>Your Role</Text>
              <Text style={styles.infoValue}>{roleTitle}</Text>
            </View>
          </View>

          {tasks.length > 0 && (
            <View style={styles.tasksRow}>
              <Ionicons name="clipboard-outline" size={24} color={colors.icon} style={styles.tasksIcon} />
              <View style={styles.tasksContent}>
                <Text style={styles.infoLabel}>Tasks</Text>
                {tasks.map((task, i) => (
                  <View key={i} style={styles.taskItem}>
                    <Text style={styles.taskBullet}>•</Text>
                    <Text style={styles.taskText}>{task}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="hourglass-outline" size={24} color={colors.icon} />
            <View>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{duration}</Text>
            </View>
          </View>

          {event.organizer && (
            <>
              <View style={styles.divider} />
              <Text style={styles.organizerLabel}>Organizer</Text>
              <View style={styles.organizerRow}>
                <View style={styles.organizerAvatar}>
                  <Text style={styles.organizerInitial}>
                    {event.organizer.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.organizerInfo}>
                  <Text style={styles.organizerName}>{event.organizer.name}</Text>
                  <Text style={styles.organizerTitle}>{event.organizer.title}</Text>
                </View>
              </View>
              <View style={styles.contactRow}>
                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                  <Ionicons name="call" size={16} color={colors.textLabel} />
                  <Text style={styles.contactBtnText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
                  <Ionicons name="mail" size={16} color={colors.textLabel} />
                  <Text style={styles.contactBtnText}>Email</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.teamHeader}>
          <Text style={styles.sectionTitle}>Your Team</Text>
          <Text style={styles.teamCount}>{teamCount} volunteers</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.teamRow}>
            {teamMembers.map((member) => (
              <View key={member.uid} style={styles.teamMember}>
                <View style={[styles.teamAvatar, { backgroundColor: member.bg, borderColor: colors.cardBackground }]}>
                  <Text style={[styles.teamInitial, { color: member.fg }]}>
                    {member.initial}
                  </Text>
                </View>
                <Text style={styles.teamName}>{member.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {isToday && (
          <TouchableOpacity
            style={styles.checkInBtn}
            onPress={() => router.push("/(tabs)/check-in")}
          >
            <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
            <Text style={styles.checkInBtnText}>Check-In Now</Text>
          </TouchableOpacity>
        )}

        {!isPast && !hasStarted && activeCheckIn?.eventId !== event.id && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelShift}>
            <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.cancelBtnText}>Cancel Shift</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    notFoundText: {
      fontSize: 16,
      color: colors.textLabel,
    },
    backLink: {
      fontSize: 15,
      color: colors.tint,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.headerBorder,
    },
    headerBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
      gap: 12,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      gap: 12,
    },
    eventCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
      marginRight: 12,
    },
    eventIcon: {
      backgroundColor: colors.emptyStateBg,
      padding: 10,
      borderRadius: 12,
    },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      marginTop: 6,
    },
    badgeText: {
      fontWeight: "600",
      fontSize: 13,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginTop: 5,
    },
    squareIcon: {
      width: 35,
      height: 35,
      backgroundColor: colors.primarySubtle,
      borderRadius: 8,
      marginTop: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textTertiary,
      marginBottom: 3,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginTop: 8,
    },
    locationHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    locationText: {
      flex: 1,
    },
    locationName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    locationAddress: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    mapPlaceholder: {
      height: 140,
      backgroundColor: colors.mapPlaceholder,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    directionsBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.cardBackground,
    },
    directionsBtnText: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textLabel,
    },
    tasksRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    tasksIcon: {
      marginTop: 2,
    },
    tasksContent: {
      flex: 1,
      gap: 4,
    },
    taskItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
    },
    taskBullet: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    taskText: {
      fontSize: 14,
      color: colors.textLabel,
      flex: 1,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: colors.cardBorder,
    },
    organizerLabel: {
      fontSize: 14,
      color: colors.textTertiary,
    },
    organizerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    organizerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primarySubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    organizerInitial: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.tint,
    },
    organizerInfo: {
      flex: 1,
    },
    organizerName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    organizerTitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row",
      gap: 12,
    },
    contactBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.cardBackground,
    },
    contactBtnText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textLabel,
    },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
    },
    teamCount: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    teamRow: {
      flexDirection: "row",
      gap: 16,
      flexWrap: "wrap",
    },
    teamMember: {
      alignItems: "center",
      gap: 6,
    },
    teamAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    teamInitial: {
      fontSize: 18,
      fontWeight: "600",
    },
    teamName: {
      fontSize: 11,
      color: colors.textLabel,
      textAlign: "center",
      maxWidth: 60,
    },
    checkInBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      marginTop: 4,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    checkInBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.danger,
      paddingVertical: 15,
      borderRadius: 14,
      marginTop: 4,
    },
    cancelBtnText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });
}
