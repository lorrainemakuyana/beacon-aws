import { Shift } from "@/interfaces";
import { Timestamp } from "firebase/firestore";

function toTimestamp(ms: number): Timestamp {
  return new Timestamp(Math.floor(ms / 1000), 0);
}

function daysFromNow(days: number, hour: number): number {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export const dummyShifts: Shift[] = [
  // ── Today ────────────────────────────────────────────────────────────────
  {
    id: "shf_001",
    eventId: "evt_001",
    title: "Morning Cleanup Crew",
    description: "Lead litter pickup teams across the park grounds.",
    timeSlot: {
      start: toTimestamp(daysFromNow(0, 9)),
      end: toTimestamp(daysFromNow(0, 13)),
    },
    requiredVolunteers: 10,
    assignedVolunteers: [
      "user_020",
      "user_021",
      "user_022",
      "user_023",
      "user_024",
    ],
    status: "active",
    role: { title: "Team Lead" },
    tasks: [
      "Distribute equipment to volunteers",
      "Assign litter pickup zones",
      "Collect and bag waste materials",
      "Load filled bags into disposal areas",
    ],
  },

  // ── Future ───────────────────────────────────────────────────────────────
  {
    id: "shf_002",
    eventId: "evt_002",
    title: "Beach Sweep Team",
    description: "Collect shoreline plastic and marine debris.",
    timeSlot: {
      start: toTimestamp(daysFromNow(5, 8)),
      end: toTimestamp(daysFromNow(5, 12)),
    },
    requiredVolunteers: 20,
    assignedVolunteers: ["user_026", "user_027", "user_028"],
    status: "open",
    role: { title: "Volunteer" },
    tasks: [
      "Collect plastic waste along the shoreline",
      "Separate recyclables from general waste",
      "Record data on waste types found",
    ],
  },
  {
    id: "shf_006",
    eventId: "evt_006",
    title: "River Debris Team",
    description: "Remove debris from riverbank.",
    timeSlot: {
      start: toTimestamp(daysFromNow(10, 7)),
      end: toTimestamp(daysFromNow(10, 11)),
    },
    requiredVolunteers: 12,
    assignedVolunteers: ["user_026"],
    status: "open",
    role: { title: "Volunteer" },
    tasks: [
      "Clear large debris from riverbank",
      "Bag and tag collected waste",
      "Assist with water-edge cleanup",
    ],
  },
  {
    id: "shf_007",
    eventId: "evt_007",
    title: "Math Tutors",
    description: "Help students with math homework and concepts.",
    timeSlot: {
      start: toTimestamp(daysFromNow(14, 15)),
      end: toTimestamp(daysFromNow(14, 18)),
    },
    requiredVolunteers: 6,
    assignedVolunteers: ["user_027", "user_028"],
    status: "open",
    role: { title: "Tutor" },
    tasks: [
      "Assist students with homework problems",
      "Explain math concepts one-on-one",
      "Review progress with lead coordinator",
    ],
  },
  {
    id: "shf_008",
    eventId: "evt_008",
    title: "Registration Desk",
    description: "Check in attendees and hand out materials.",
    timeSlot: {
      start: toTimestamp(daysFromNow(21, 9)),
      end: toTimestamp(daysFromNow(21, 17)),
    },
    requiredVolunteers: 5,
    assignedVolunteers: ["user_029"],
    status: "open",
    role: { title: "Desk Volunteer" },
    tasks: [
      "Check in registered attendees",
      "Hand out event materials and badges",
      "Direct visitors to booths",
      "Manage walk-in registrations",
    ],
  },
  {
    id: "shf_009",
    eventId: "evt_009",
    title: "Coat Sorting Team",
    description: "Sort and organize donated winter coats by size.",
    timeSlot: {
      start: toTimestamp(daysFromNow(30, 10)),
      end: toTimestamp(daysFromNow(30, 14)),
    },
    requiredVolunteers: 10,
    assignedVolunteers: [],
    status: "open",
    role: { title: "Sorter" },
    tasks: [
      "Sort coats by size and condition",
      "Tag and label each item",
      "Rack coats for distribution",
    ],
  },

  // ── Past ─────────────────────────────────────────────────────────────────
  {
    id: "shf_003",
    eventId: "evt_003",
    title: "Food Sorting Line",
    description: "Sort donated food items by category and expiry.",
    timeSlot: {
      start: toTimestamp(daysFromNow(-7, 10)),
      end: toTimestamp(daysFromNow(-7, 14)),
    },
    requiredVolunteers: 15,
    assignedVolunteers: ["user_022", "user_023", "user_024"],
    status: "completed",
    role: { title: "Supply Sorter" },
    tasks: [
      "Sort donated food items by category",
      "Check expiration dates and remove expired items",
      "Package items for distribution",
      "Assist with loading vehicles for delivery",
    ],
  },
  {
    id: "shf_004",
    eventId: "evt_004",
    title: "Animal Care Shift",
    description: "Feed and clean animal areas at the shelter.",
    timeSlot: {
      start: toTimestamp(daysFromNow(-14, 9)),
      end: toTimestamp(daysFromNow(-14, 13)),
    },
    requiredVolunteers: 8,
    assignedVolunteers: ["user_025"],
    status: "completed",
    role: { title: "Animal Care Volunteer" },
    tasks: [
      "Feed and water shelter animals",
      "Clean kennels and enclosures",
      "Assist with exercise time for dogs",
    ],
  },
  {
    id: "shf_005",
    eventId: "evt_005",
    title: "Tree Planting Crew",
    description: "Plant and stake new trees across the neighborhood.",
    timeSlot: {
      start: toTimestamp(daysFromNow(-21, 8)),
      end: toTimestamp(daysFromNow(-21, 12)),
    },
    requiredVolunteers: 25,
    assignedVolunteers: [],
    status: "closed",
    role: { title: "Volunteer" },
    tasks: [
      "Dig planting holes to specified depth",
      "Plant and stake new trees",
      "Water newly planted trees",
    ],
  },
  {
    id: "shf_010",
    eventId: "evt_010",
    title: "Garden Build Crew",
    description: "Construct raised garden beds for the community.",
    timeSlot: {
      start: toTimestamp(daysFromNow(-60, 8)),
      end: toTimestamp(daysFromNow(-60, 12)),
    },
    requiredVolunteers: 18,
    assignedVolunteers: ["user_030"],
    status: "completed",
    role: { title: "Build Volunteer" },
    tasks: [
      "Assemble raised bed frames",
      "Fill beds with soil and compost",
      "Mark planting zones",
    ],
  },
];
