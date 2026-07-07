import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";

const SCREEN_W = Dimensions.get("window").width;
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";
import { useUserIncidents } from "@/hooks/useUserIncidents";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { Incident, IncidentSeverity } from "@/interfaces";
import { useState } from "react";

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const STATUS_LABELS: Record<Incident["status"], string> = {
  open: "Open",
  investigating: "Investigating",
  resolved: "Resolved",
  closed: "Closed",
};

export default function IncidentsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { incidents, loading } = useUserIncidents(user?.uid);
  const { events } = useUpcomingEvents();
  const styles = getStyles(colors);

  const [photoModal, setPhotoModal] = useState<{ photos: string[]; startIndex: number } | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const eventsMap = Object.fromEntries(events.map((e) => [e.id, e]));

  const openPhotoModal = (photos: string[], startIndex: number) => {
    setActivePhotoIndex(startIndex);
    setPhotoModal({ photos, startIndex });
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, incidents.length === 0 && !loading && styles.contentEmpty]}
        showsVerticalScrollIndicator={false}
      >

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No incidents reported</Text>
            <Text style={styles.emptySubtitle}>Incidents you report will appear here.</Text>
          </View>
        ) : (
          incidents.map((incident) => {
            const event = eventsMap[incident.eventId];
            return (
              <IncidentCard
                key={incident.id}
                incident={incident}
                eventTitle={event?.title}
                colors={colors}
                onPhotoPress={openPhotoModal}
                styles={styles}
              />
            );
          })
        )}

        {/* bottom padding so last card isn't hidden behind CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pinned Report button */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push("/report-incident")}
          activeOpacity={0.85}
        >
          <Ionicons name="warning" size={20} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>Report an Incident</Text>
        </TouchableOpacity>
      </View>

      {/* Photo fullscreen modal */}
      {photoModal && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPhotoModal(null)}>
          <View style={styles.photoModalBg}>
            <TouchableOpacity style={styles.photoModalClose} onPress={() => setPhotoModal(null)}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <FlatList
              data={photoModal.photos}
              horizontal
              pagingEnabled
              initialScrollIndex={photoModal.startIndex}
              getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                setActivePhotoIndex(idx);
              }}
              renderItem={({ item }) => (
                <View style={styles.photoModalSlide}>
                  <Image source={{ uri: item }} style={styles.photoModalImage} resizeMode="contain" />
                </View>
              )}
            />
            <Text style={styles.photoCounter}>
              {activePhotoIndex + 1} / {photoModal.photos.length}
            </Text>
          </View>
        </Modal>
      )}
    </View>
  );
}

function IncidentCard({
  incident,
  eventTitle,
  colors,
  onPhotoPress,
  styles,
}: {
  incident: Incident;
  eventTitle?: string;
  colors: ThemeColors;
  onPhotoPress: (photos: string[], startIndex: number) => void;
  styles: ReturnType<typeof getStyles>;
}) {
  const severityColor = SEVERITY_COLORS[incident.severity];
  const hasPhotos = incident.photos && incident.photos.length > 0;

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardType}>{incident.title}</Text>
          <View style={[styles.severityBadge, { backgroundColor: severityColor + "22", borderColor: severityColor }]}>
            <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
            <Text style={[styles.severityLabel, { color: severityColor }]}>
              {SEVERITY_LABELS[incident.severity]}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, incident.status === "resolved" && styles.statusResolved]}>
          <Text style={[styles.statusText, incident.status === "resolved" && styles.statusTextResolved]}>
            {STATUS_LABELS[incident.status]}
          </Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        {eventTitle && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
            <Text style={styles.metaText} numberOfLines={1}>{eventTitle}</Text>
          </View>
        )}
        {incident.location ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
            <Text style={styles.metaText} numberOfLines={1}>{incident.location}</Text>
          </View>
        ) : null}
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={3}>{incident.description}</Text>

      {/* Photos */}
      {hasPhotos && (
        <View style={styles.photosRow}>
          {incident.photos!.map((uri, i) => (
            <TouchableOpacity key={i} onPress={() => onPhotoPress(incident.photos!, i)}>
              <Image source={{ uri }} style={styles.photoThumb} />
              {i === 3 && incident.photos!.length > 4 && (
                <View style={styles.photoMore}>
                  <Text style={styles.photoMoreText}>+{incident.photos!.length - 4}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Resolution */}
      {incident.resolution ? (
        <View style={styles.resolution}>
          <View style={styles.resolutionHeader}>
            <Ionicons name="checkmark-circle" size={14} color={colors.tint} />
            <Text style={styles.resolutionLabel}>Resolution</Text>
          </View>
          <Text style={styles.resolutionText}>{incident.resolution}</Text>
        </View>
      ) : (
        <View style={styles.pendingResolution}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.pendingText}>Awaiting coordinator review</Text>
        </View>
      )}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.surfaceBackground,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 20,
      gap: 14,
    },
    contentEmpty: {
      flex: 1,
      justifyContent: "center",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 16,
      gap: 10,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },
    cardTitleRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    cardType: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    severityBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
    },
    severityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    severityLabel: {
      fontSize: 11,
      fontWeight: "600",
    },
    statusBadge: {
      backgroundColor: colors.emptyStateBg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    statusResolved: {
      backgroundColor: colors.primarySubtle,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.textTertiary,
    },
    statusTextResolved: {
      color: colors.primary,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.textTertiary,
      maxWidth: 160,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 19,
    },
    photosRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    photoThumb: {
      width: 72,
      height: 72,
      borderRadius: 8,
      backgroundColor: colors.emptyStateBg,
    },
    photoMore: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    photoMoreText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
    resolution: {
      backgroundColor: colors.primarySubtle,
      borderRadius: 8,
      padding: 10,
      gap: 4,
    },
    resolutionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    resolutionLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.tint,
    },
    resolutionText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    pendingResolution: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    pendingText: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    ctaContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#F97316",
      paddingVertical: 15,
      borderRadius: 14,
    },
    ctaBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    photoModalBg: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.92)",
      justifyContent: "center",
    },
    photoModalClose: {
      position: "absolute",
      top: 56,
      right: 20,
      zIndex: 10,
      padding: 8,
    },
    photoModalSlide: {
      width: SCREEN_W,
      justifyContent: "center",
      alignItems: "center",
    },
    photoModalImage: {
      width: SCREEN_W,
      height: SCREEN_W,
    },
    photoCounter: {
      position: "absolute",
      bottom: 60,
      alignSelf: "center",
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
      backgroundColor: "rgba(0,0,0,0.5)",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
  });
}
