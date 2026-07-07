import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/theme";
import { useUserShifts } from "@/hooks/useUserShifts";
import { useAuth } from "@/context/AuthContext";
import { reportIncident, uploadIncidentPhoto } from "@/firebase/services/incidents";
import { IncidentCategory, IncidentSeverity } from "@/interfaces";

type IncidentType = "Safety Hazard" | "Equipment Issue" | "Behavioral Concern" | "Medical Emergency" | "Other";
type Severity = "Low" | "Medium" | "High" | "Critical";

const INCIDENT_TYPES: IncidentType[] = [
  "Safety Hazard",
  "Equipment Issue",
  "Behavioral Concern",
  "Medical Emergency",
  "Other",
];

const SEVERITY_COLORS: Record<Severity, string> = {
  Low: "#22C55E",
  Medium: "#F59E0B",
  High: "#F97316",
  Critical: "#EF4444",
};

const CATEGORY_MAP: Record<IncidentType, IncidentCategory> = {
  "Safety Hazard": "safety",
  "Equipment Issue": "equipment",
  "Behavioral Concern": "volunteer",
  "Medical Emergency": "safety",
  "Other": "other",
};

export default function ReportIncidentScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { shiftId, eventId } = useLocalSearchParams<{ shiftId?: string; eventId?: string }>();
  const { shifts, eventsMap } = useUserShifts(user?.uid);

  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string>(shiftId ?? "");
  const [shiftDropdownOpen, setShiftDropdownOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoModal, setPhotoModal] = useState<{ index: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const styles = getStyles(colors);

  const pickPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limit reached", "You can add up to 5 photos.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow photo access to attach photos.");
      return;
    }
    const remaining = 5 - photos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as const,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri).slice(0, remaining);
      setPhotos((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const deletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoModal(null);
  };

  const selectedShift = shifts.find((s) => s.id === selectedShiftId);
  const selectedEvent = selectedShift ? eventsMap[selectedShift.eventId] : null;

  const handleSubmit = async () => {
    if (!incidentType) { Alert.alert("Required", "Please select a type of incident."); return; }
    if (!severity) { Alert.alert("Required", "Please select a severity level."); return; }
    if (!description.trim()) { Alert.alert("Required", "Please describe what happened."); return; }
    if (!user) { Alert.alert("Error", "You must be signed in to report an incident."); return; }

    const resolvedEventId = eventId ?? selectedShift?.eventId ?? "";
    if (!resolvedEventId) { Alert.alert("Required", "Please select a related shift or open this screen from an event."); return; }

    setSubmitting(true);
    try {
      const uploadedUrls = await Promise.all(
        photos.map((uri, i) => uploadIncidentPhoto(user.uid, uri, i))
      );
      await reportIncident({
        eventId: resolvedEventId,
        shiftId: selectedShiftId || undefined,
        reporterId: user.uid,
        title: incidentType,
        description: description.trim(),
        location: location.trim() || undefined,
        severity: severity.toLowerCase() as IncidentSeverity,
        category: CATEGORY_MAP[incidentType],
        photos: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Report Submitted", "Your incident report has been sent.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={styles.saveDraftBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Type of Incident */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Type of Incident <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipWrap}>
            {INCIDENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, incidentType === type && styles.chipActive]}
                onPress={() => setIncidentType(type)}
              >
                <Text style={[styles.chipText, incidentType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Related Shift — dropdown */}
        <View style={styles.field}>
          <Text style={styles.label}>Related Shift</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setShiftDropdownOpen(true)}
          >
            {selectedShift && selectedEvent ? (
              <View style={styles.dropdownSelected}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownSelectedTitle} numberOfLines={1}>
                    {selectedEvent.title}
                  </Text>
                  <Text style={styles.dropdownSelectedSub} numberOfLines={1}>
                    {selectedShift.title}
                  </Text>
                </View>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={(e) => { e.stopPropagation(); setSelectedShiftId(""); }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dropdownPlaceholder}>
                <Text style={styles.dropdownPlaceholderText}>Select a shift</Text>
                <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
              </View>
            )}
          </TouchableOpacity>

          {/* Dropdown modal */}
          <Modal
            visible={shiftDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setShiftDropdownOpen(false)}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setShiftDropdownOpen(false)}>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Select Related Shift</Text>
                {shifts.length === 0 ? (
                  <Text style={styles.noShiftsText}>No assigned shifts</Text>
                ) : (
                  <FlatList
                    data={shifts}
                    keyExtractor={(s) => s.id}
                    ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                    renderItem={({ item: s }) => {
                      const ev = eventsMap[s.eventId];
                      if (!ev) return null;
                      const isSelected = s.id === selectedShiftId;
                      return (
                        <TouchableOpacity
                          style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                          onPress={() => { setSelectedShiftId(s.id); setShiftDropdownOpen(false); }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.modalOptionTitle, isSelected && styles.modalOptionTitleSelected]}>
                              {ev.title}
                            </Text>
                            <Text style={styles.modalOptionSub}>{s.title}</Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder={selectedEvent?.location ?? "Enter location"}
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textarea}
            value={description}
            onChangeText={(t) => t.length <= 500 && setDescription(t)}
            placeholder="Describe what happened in detail..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Severity */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Severity Level <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.severityGrid}>
            {(Object.keys(SEVERITY_COLORS) as Severity[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityBtn,
                  severity === level && {
                    borderColor: SEVERITY_COLORS[level],
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSeverity(level)}
              >
                <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[level] }]} />
                <Text style={styles.severityText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Photos — hidden until image storage is configured */}
        {false && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Add Photos (Optional)</Text>
              <View style={styles.photosRow}>
                {photos.map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => setPhotoModal({ index: i })}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                  </TouchableOpacity>
                ))}
                {photos.length < 5 && (
                  <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhoto}>
                    <Ionicons name="camera-outline" size={28} color={colors.textTertiary} />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.photoHint}>{photos.length}/5 photos added</Text>
            </View>

            {photoModal && (
              <Modal visible transparent animationType="fade" onRequestClose={() => setPhotoModal(null)}>
                <View style={styles.photoModalBg}>
                  <TouchableOpacity style={styles.photoModalClose} onPress={() => setPhotoModal(null)}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Image source={{ uri: photos[photoModal!.index] }} style={styles.photoModalImage} resizeMode="contain" />
                  <TouchableOpacity
                    style={styles.photoDeleteBtn}
                    onPress={() => {
                      Alert.alert("Delete Photo", "Remove this photo?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deletePhoto(photoModal!.index) },
                      ]);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.photoDeleteText}>Delete Photo</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}
          </>
        )}

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle" size={16} color={colors.tint} />
          <Text style={styles.footerNoteText}>This report will be sent to your shift coordinator</Text>
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={[styles.submitContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.headerBorder,
    },
    headerBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    saveDraftBtn: {
      width: 40,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 20,
      gap: 24,
      paddingBottom: 8,
    },
    field: {
      gap: 10,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    required: {
      color: colors.danger,
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: "#FFFFFF",
    },
    dropdownTrigger: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      minHeight: 52,
      justifyContent: "center",
    },
    dropdownPlaceholder: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    dropdownPlaceholderText: {
      fontSize: 15,
      color: colors.textTertiary,
    },
    dropdownSelected: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    dropdownSelectedTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    dropdownSelectedSub: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: "60%",
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    modalSeparator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      gap: 12,
    },
    modalOptionSelected: {
      backgroundColor: colors.primarySubtle,
    },
    modalOptionTitle: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    modalOptionTitleSelected: {
      color: colors.primary,
      fontWeight: "600",
    },
    modalOptionSub: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    noShiftsText: {
      fontSize: 13,
      color: colors.textTertiary,
      padding: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      padding: 14,
      fontSize: 15,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    textarea: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      padding: 14,
      fontSize: 15,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
      minHeight: 120,
    },
    charCount: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: "right",
    },
    severityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    severityBtn: {
      width: "47%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    severityDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    severityText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    photosRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    photoThumb: {
      width: 90,
      height: 90,
      borderRadius: 10,
      backgroundColor: colors.emptyStateBg,
    },
    addPhotoBtn: {
      width: 90,
      height: 90,
      backgroundColor: colors.emptyStateBg,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addPhotoText: {
      fontSize: 11,
      color: colors.textTertiary,
    },
    photoHint: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    photoModalBg: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.92)",
      justifyContent: "center",
      alignItems: "center",
    },
    photoModalClose: {
      position: "absolute",
      top: 56,
      right: 20,
      zIndex: 10,
      padding: 8,
    },
    photoModalImage: {
      width: "100%",
      height: 400,
    },
    photoDeleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 24,
      backgroundColor: "#EF444488",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    photoDeleteText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 15,
    },
    footerNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.infoSubtle,
      padding: 14,
      borderRadius: 10,
    },
    footerNoteText: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    submitContainer: {
      padding: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
