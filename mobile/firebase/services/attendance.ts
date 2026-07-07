import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { Attendance, Event, Shift, COLLECTIONS } from "@/interfaces";
import { getShiftById, getUserShiftForEvent } from "./shifts";
import { getEventById } from "./events";

export async function getActiveCheckIn(userId: string): Promise<Attendance | null> {
  const q = query(
    collection(firestore, COLLECTIONS.ATTENDANCE),
    where("volunteerId", "==", userId),
    where("status", "==", "checked-in"),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Attendance;
}

export async function verifyEventCode(
  code: string,
  userId: string,
): Promise<{ event: Event; shift: Shift } | null> {
  const q = query(
    collection(firestore, COLLECTIONS.EVENTS),
    where("eventCode", "==", code.trim()),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const event = { id: snap.docs[0].id, ...snap.docs[0].data() } as Event;
  const shift = await getUserShiftForEvent(event.id, userId);
  if (!shift) return null;

  return { event, shift };
}

export async function checkInToShift(
  userId: string,
  shiftId: string,
  eventId: string,
): Promise<string> {
  const existing = await getActiveCheckIn(userId);
  if (existing) throw new Error("You are already checked in to a shift.");

  const ref = await addDoc(collection(firestore, COLLECTIONS.ATTENDANCE), {
    volunteerId: userId,
    shiftId,
    eventId,
    status: "checked-in",
    checkIn: { timestamp: Date.now() },
  });
  return ref.id;
}

export async function checkOutFromShift(attendanceId: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.ATTENDANCE, attendanceId), {
    status: "checked-out",
    checkOut: { timestamp: Date.now() },
  });
}

export async function getUserAttendanceRecords(userId: string): Promise<Attendance[]> {
  const q = query(
    collection(firestore, COLLECTIONS.ATTENDANCE),
    where("volunteerId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Attendance);
}
