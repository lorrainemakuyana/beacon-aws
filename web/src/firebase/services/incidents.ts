import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { Incident, IncidentStatus, COLLECTIONS } from "@/interfaces";

export async function getAllIncidents(): Promise<Incident[]> {
  const q = query(
    collection(firestore, COLLECTIONS.INCIDENTS),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident);
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.INCIDENTS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Incident) : null;
}

export async function getIncidentsByEventId(
  eventId: string
): Promise<Incident[]> {
  const q = query(
    collection(firestore, COLLECTIONS.INCIDENTS),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident);
}

export async function getIncidentsByEventIds(eventIds: string[]): Promise<Incident[]> {
  if (eventIds.length === 0) return [];
  const results: Incident[] = [];
  for (let i = 0; i < eventIds.length; i += 30) {
    const chunk = eventIds.slice(i, i + 30);
    const q = query(
      collection(firestore, COLLECTIONS.INCIDENTS),
      where("eventId", "in", chunk),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => results.push({ id: d.id, ...d.data() } as Incident));
  }
  return results.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.INCIDENTS, id), {
    status,
    updatedAt: Date.now(),
  });
}
