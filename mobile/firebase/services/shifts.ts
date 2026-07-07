import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { Shift, COLLECTIONS } from "@/interfaces";

export async function getShiftById(shiftId: string): Promise<Shift | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.SHIFTS, shiftId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Shift) : null;
}

export async function getShiftsForUser(userId: string): Promise<Shift[]> {
  const q = query(
    collection(firestore, COLLECTIONS.SHIFTS),
    where("assignedVolunteers", "array-contains", userId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Shift);
}

export async function signUpForEventShift(eventId: string, userId: string): Promise<void> {
  const q = query(
    collection(firestore, COLLECTIONS.SHIFTS),
    where("eventId", "==", eventId),
    where("status", "in", ["open", "active"]),
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No available shifts for this event");

  const shiftDoc = snap.docs[0];
  const data = shiftDoc.data() as Omit<Shift, "id">;
  if (data.assignedVolunteers?.includes(userId)) {
    throw new Error("You are already signed up for this event");
  }

  await updateDoc(doc(firestore, COLLECTIONS.SHIFTS, shiftDoc.id), {
    assignedVolunteers: arrayUnion(userId),
  });
}

export async function getUserShiftForEvent(eventId: string, userId: string): Promise<Shift | null> {
  const q = query(
    collection(firestore, COLLECTIONS.SHIFTS),
    where("eventId", "==", eventId),
    where("assignedVolunteers", "array-contains", userId),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Shift;
}

export async function cancelVolunteerShift(eventId: string, userId: string): Promise<void> {
  const shift = await getUserShiftForEvent(eventId, userId);
  if (!shift) throw new Error("You are not signed up for this event");
  await updateDoc(doc(firestore, COLLECTIONS.SHIFTS, shift.id), {
    assignedVolunteers: arrayRemove(userId),
  });
}
