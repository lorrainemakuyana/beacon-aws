import {
  collection,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentReference,
  CollectionReference,
  QueryConstraint,
} from "firebase/firestore";
import { firestore } from "./config";
import { COLLECTIONS } from "../interfaces";

// Collection references
export const getUsersCollection = () =>
  collection(firestore, COLLECTIONS.USERS);
export const getOrganizationsCollection = () =>
  collection(firestore, COLLECTIONS.ORGANIZATIONS);
export const getEventsCollection = () =>
  collection(firestore, COLLECTIONS.EVENTS);
export const getAttendanceCollection = () =>
  collection(firestore, COLLECTIONS.ATTENDANCE);
export const getIncidentsCollection = () =>
  collection(firestore, COLLECTIONS.INCIDENTS);
export const getNotificationsCollection = () =>
  collection(firestore, COLLECTIONS.NOTIFICATIONS);
export const getPaymentsCollection = () =>
  collection(firestore, COLLECTIONS.PAYMENTS);

// Document references
export const getUserDoc = (userId: string) =>
  doc(firestore, COLLECTIONS.USERS, userId);
export const getOrganizationDoc = (orgId: string) =>
  doc(firestore, COLLECTIONS.ORGANIZATIONS, orgId);
export const getEventDoc = (eventId: string) =>
  doc(firestore, COLLECTIONS.EVENTS, eventId);
export const getAttendanceDoc = (recordId: string) =>
  doc(firestore, COLLECTIONS.ATTENDANCE, recordId);
export const getIncidentDoc = (incidentId: string) =>
  doc(firestore, COLLECTIONS.INCIDENTS, incidentId);
export const getNotificationDoc = (notificationId: string) =>
  doc(firestore, COLLECTIONS.NOTIFICATIONS, notificationId);
export const getPaymentDoc = (paymentId: string) =>
  doc(firestore, COLLECTIONS.PAYMENTS, paymentId);

export const timestampToDate = (timestamp: Timestamp) => {
  return timestamp.toDate();
};

// Query builders
export const buildQuery = (
  collectionRef: CollectionReference,
  constraints: QueryConstraint[],
) => {
  return query(collectionRef, ...constraints);
};

// Common query patterns
export const getEventsByOrganization = (organizationId: string) => {
  return buildQuery(getEventsCollection(), [
    where("organizationId", "==", organizationId),
    orderBy("dateRange.start", "desc"),
  ]);
};

export const getUpcomingEvents = () => {
  return buildQuery(getEventsCollection(), [
    where("status", "==", "published"),
    where("dateRange.start", ">", Date.now()),
    orderBy("dateRange.start", "asc"),
  ]);
};

export const getUserAttendance = (userId: string) => {
  return buildQuery(getAttendanceCollection(), [
    where("volunteerId", "==", userId),
    orderBy("checkIn.timestamp", "desc"),
  ]);
};

export const getEventIncidents = (eventId: string) => {
  return buildQuery(getIncidentsCollection(), [
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc"),
  ]);
};

export const getUserNotifications = (userId: string, limitCount = 50) => {
  return buildQuery(getNotificationsCollection(), [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  ]);
};

// Error handling utilities
export const handleFirebaseError = (error: any) => {
  console.error("Firebase error:", error);

  // Map Firebase error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    "permission-denied": "You do not have permission to perform this action.",
    "not-found": "The requested resource was not found.",
    "already-exists": "This resource already exists.",
    "failed-precondition": "The operation failed due to a precondition.",
    aborted: "The operation was aborted.",
    "out-of-range": "The operation was attempted past the valid range.",
    unimplemented: "This operation is not implemented.",
    internal: "An internal error occurred.",
    unavailable: "The service is currently unavailable.",
    "data-loss": "Unrecoverable data loss or corruption.",
    unauthenticated: "You must be authenticated to perform this action.",
  };

  return errorMessages[error.code] || "An unexpected error occurred.";
};

// Free tier optimization utilities
export const optimizeForFreeTier = {
  // Batch reads to minimize read operations
  batchRead: async (docRefs: DocumentReference[]) => {
    const promises = docRefs.map((ref) => getDoc(ref));
    return Promise.all(promises);
  },

  // Use efficient queries to minimize reads
  getRecentEvents: (limitN: number = 10) => {
    return buildQuery(getEventsCollection(), [
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(limitN),
    ]);
  },

  // Cache frequently accessed data client-side
  cacheKey: (collection: string, id: string) => `${collection}_${id}`,
};
