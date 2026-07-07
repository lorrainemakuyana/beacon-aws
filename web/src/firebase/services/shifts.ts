import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { Shift, COLLECTIONS } from "@/interfaces";

export async function getAllShifts(): Promise<Shift[]> {
  const snap = await getDocs(collection(firestore, COLLECTIONS.SHIFTS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Shift);
}

export async function getShiftById(id: string): Promise<Shift | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.SHIFTS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Shift) : null;
}

export async function getShiftsByEventId(eventId: string): Promise<Shift[]> {
  const q = query(
    collection(firestore, COLLECTIONS.SHIFTS),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Shift);
}

export async function getShiftsByEventIds(eventIds: string[]): Promise<Shift[]> {
  if (eventIds.length === 0) return [];
  const results: Shift[] = [];
  for (let i = 0; i < eventIds.length; i += 30) {
    const chunk = eventIds.slice(i, i + 30);
    const q = query(
      collection(firestore, COLLECTIONS.SHIFTS),
      where("eventId", "in", chunk)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => results.push({ id: d.id, ...d.data() } as Shift));
  }
  return results;
}
