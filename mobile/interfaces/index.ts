import { Timestamp } from "firebase/firestore";

export type UserRole = "volunteer" | "coordinator" | "collaborator" | "owner";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string;
  createdAt: number;
  lastActive: number;
  skills: string[];
}

export type ShiftStatus =
  | "open"
  | "full"
  | "active"
  | "completed"
  | "closed"
  | "attended"
  | "missed";

export interface ShiftTimeSlot {
  start: Timestamp;
  end: Timestamp;
}

export interface Shift {
  id: string;
  eventId: string;
  title: string;
  description: string;
  timeSlot: ShiftTimeSlot;
  requiredVolunteers: number;
  assignedVolunteers: string[]; // User UIDs
  status: ShiftStatus;
  role?: { title: string };
  tasks?: string[];
}

export type EventStatus =
  | "draft"
  | "published"
  | "active"
  | "completed"
  | "cancelled";

export interface EventOrganizer {
  name: string;
  title: string;
  phone?: string;
  email?: string;
}

export interface Event {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  date: string;
  startTime: string;
  endTime: string;
  shifts: string[]; // Shift IDs
  coordinators: string[]; // User UIDs
  collaborators: string[]; // User UIDs
  organizer?: EventOrganizer;
  status: EventStatus;
  eventCode: string; // Passphrase for manual check-in
  createdAt: number;
  updatedAt: number;
}

export type AttendanceStatus = "checked-in" | "checked-out";

export interface Attendance {
  id: string;
  volunteerId: string;
  shiftId: string;
  eventId: string;
  status: AttendanceStatus;
  checkIn: { timestamp: number };
  checkOut?: { timestamp: number };
}

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentCategory = "safety" | "equipment" | "volunteer" | "other";
export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";

export interface Incident {
  id: string;
  eventId: string;
  shiftId?: string;
  reporterId: string;
  title: string;
  description: string;
  location?: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  photos?: string[]; // Storage URLs
  status: IncidentStatus;
  assignedTo?: string; // Coordinator UID
  resolution?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  ownerId: string; // User UID
  coordinators: string[]; // User UIDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NotificationType =
  | "shift_reminder"
  | "shift_change"
  | "event_update"
  | "incident_alert"
  | "announcement"
  | "general";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>; // Additional data for navigation
  createdAt: Timestamp;
}

// Firebase collection names
export const COLLECTIONS = {
  USERS: "users",
  ORGANIZATIONS: "organizations",
  EVENTS: "events",
  SHIFTS: "shifts",
  ATTENDANCE: "attendance",
  INCIDENTS: "incidents",
  NOTIFICATIONS: "notifications",
  PAYMENTS: "payments",
} as const;
