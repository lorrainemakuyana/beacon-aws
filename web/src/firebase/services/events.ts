import {
  Timestamp,
  WriteBatch,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { Event, EventStatus, COLLECTIONS } from "@/interfaces";

// Commit an arbitrary list of batch operations in chunks of ≤499 (Firestore limit is 500)
async function runInBatches(
  ops: Array<(b: WriteBatch) => void>
): Promise<void> {
  const LIMIT = 499;
  for (let i = 0; i < ops.length; i += LIMIT) {
    const b = writeBatch(firestore);
    ops.slice(i, i + LIMIT).forEach((op) => op(b));
    await b.commit();
  }
}

export async function getAllEvents(): Promise<Event[]> {
  const q = query(
    collection(firestore, COLLECTIONS.EVENTS),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event);
}

export async function getEventById(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.EVENTS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Event) : null;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split("T")[0];
  const q = query(
    collection(firestore, COLLECTIONS.EVENTS),
    where("date", ">=", today),
    orderBy("date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event);
}

export async function updateEventStatus(
  id: string,
  status: EventStatus
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.EVENTS, id), {
    status,
    updatedAt: Date.now(),
  });
}

export async function createEvent(
  data: Omit<Event, "id" | "createdAt" | "updatedAt" | "shifts">,
  shiftDefs: Array<{ title: string; requiredVolunteers: number }>
): Promise<string> {
  const eventRef = await addDoc(collection(firestore, COLLECTIONS.EVENTS), {
    ...data,
    shifts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const startDateTime = new Date(`${data.date}T${data.startTime}`);
  const endDateTime = new Date(`${data.date}T${data.endTime}`);

  // Create all shifts in parallel
  const shiftRefs = await Promise.all(
    shiftDefs.map((shiftDef) =>
      addDoc(collection(firestore, COLLECTIONS.SHIFTS), {
        eventId: eventRef.id,
        title: shiftDef.title,
        description: "",
        role: { title: shiftDef.title },
        timeSlot: {
          start: Timestamp.fromDate(startDateTime),
          end: Timestamp.fromDate(endDateTime),
        },
        requiredVolunteers: shiftDef.requiredVolunteers,
        assignedVolunteers: [],
        status: "open",
      })
    )
  );

  await updateDoc(eventRef, { shifts: shiftRefs.map((r) => r.id) });
  return eventRef.id;
}

export async function deleteEvent(id: string): Promise<void> {
  const eventSnap = await getDoc(doc(firestore, COLLECTIONS.EVENTS, id));
  if (!eventSnap.exists()) return;
  const eventData = eventSnap.data() as Event;

  const [shiftsSnap, incidentsSnap] = await Promise.all([
    getDocs(query(collection(firestore, COLLECTIONS.SHIFTS), where("eventId", "==", id))),
    getDocs(query(collection(firestore, COLLECTIONS.INCIDENTS), where("eventId", "==", id))),
  ]);

  const collaborators: string[] = eventData.collaborators ?? [];

  const ops: Array<(b: WriteBatch) => void> = [
    (b) => b.delete(doc(firestore, COLLECTIONS.EVENTS, id)),
    ...shiftsSnap.docs.map((d) => (b: WriteBatch) => b.delete(d.ref)),
    ...incidentsSnap.docs.map((d) => (b: WriteBatch) => b.delete(d.ref)),
    ...collaborators.map(
      (uid) => (b: WriteBatch) =>
        b.update(doc(firestore, COLLECTIONS.USERS, uid), { events: arrayRemove(id) })
    ),
  ];

  await runInBatches(ops);
}

export async function archiveEvent(id: string): Promise<void> {
  const [shiftsSnap, incidentsSnap] = await Promise.all([
    getDocs(query(collection(firestore, COLLECTIONS.SHIFTS), where("eventId", "==", id))),
    getDocs(query(collection(firestore, COLLECTIONS.INCIDENTS), where("eventId", "==", id))),
  ]);

  const ops: Array<(b: WriteBatch) => void> = [
    (b) => b.update(doc(firestore, COLLECTIONS.EVENTS, id), { status: "archived", updatedAt: Date.now() }),
    ...shiftsSnap.docs.map((d) => (b: WriteBatch) =>
      b.update(d.ref, { previousStatus: d.data().status, status: "archived" })
    ),
    ...incidentsSnap.docs.map((d) => (b: WriteBatch) =>
      b.update(d.ref, { previousStatus: d.data().status, status: "archived", updatedAt: Date.now() })
    ),
  ];

  await runInBatches(ops);
}

export async function unarchiveEvent(id: string): Promise<void> {
  const [shiftsSnap, incidentsSnap] = await Promise.all([
    getDocs(query(collection(firestore, COLLECTIONS.SHIFTS), where("eventId", "==", id), where("status", "==", "archived"))),
    getDocs(query(collection(firestore, COLLECTIONS.INCIDENTS), where("eventId", "==", id), where("status", "==", "archived"))),
  ]);

  const ops: Array<(b: WriteBatch) => void> = [
    (b) => b.update(doc(firestore, COLLECTIONS.EVENTS, id), { status: "published", updatedAt: Date.now() }),
    ...shiftsSnap.docs.map((d) => (b: WriteBatch) =>
      b.update(d.ref, { status: d.data().previousStatus ?? "open", previousStatus: deleteField() })
    ),
    ...incidentsSnap.docs.map((d) => (b: WriteBatch) =>
      b.update(d.ref, { status: d.data().previousStatus ?? "open", previousStatus: deleteField(), updatedAt: Date.now() })
    ),
  ];

  await runInBatches(ops);
}

export async function getManagerEvents(userId: string): Promise<Event[]> {
  const [coordSnap, collabSnap] = await Promise.all([
    getDocs(query(
      collection(firestore, COLLECTIONS.EVENTS),
      where("coordinators", "array-contains", userId),
      orderBy("date", "desc")
    )),
    getDocs(query(
      collection(firestore, COLLECTIONS.EVENTS),
      where("collaborators", "array-contains", userId),
      orderBy("date", "desc")
    )),
  ]);
  const seen = new Set<string>();
  const results: Event[] = [];
  for (const snap of [coordSnap, collabSnap]) {
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        results.push({ id: d.id, ...d.data() } as Event);
      }
    }
  }
  return results.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function addCollaboratorToEvent(
  eventId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  const q = query(
    collection(firestore, COLLECTIONS.USERS),
    where("email", "==", email),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    return { success: false, message: "No user found with that email" };
  }
  const userDoc = snap.docs[0];
  await updateDoc(doc(firestore, COLLECTIONS.EVENTS, eventId), {
    collaborators: arrayUnion(userDoc.id),
  });
  await updateDoc(doc(firestore, COLLECTIONS.USERS, userDoc.id), {
    events: arrayUnion(eventId),
  });
  return { success: true, message: "Collaborator added" };
}
