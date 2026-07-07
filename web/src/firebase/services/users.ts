import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { User, COLLECTIONS } from "@/interfaces";
import { getManagerEvents } from "./events";
import { getShiftsByEventId } from "./shifts";

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(firestore, COLLECTIONS.USERS));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as User);
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.USERS, uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as User) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(
    collection(firestore, COLLECTIONS.USERS),
    where("email", "==", email),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...d.data() } as User;
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) return [];
  const results: User[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const chunk = ids.slice(i, i + 30);
    const q = query(
      collection(firestore, COLLECTIONS.USERS),
      where(documentId(), "in", chunk)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => results.push({ uid: d.id, ...d.data() } as User));
  }
  return results;
}

export async function getVolunteersForManager(userId: string): Promise<User[]> {
  // 1. Get all events managed by this user
  const events = await getManagerEvents(userId);
  // 2. Get all shifts for those events
  const shiftArrays = await Promise.all(events.map((e) => getShiftsByEventId(e.id)));
  // 3. Collect unique volunteer UIDs
  const uids = new Set<string>();
  for (const shifts of shiftArrays) {
    for (const shift of shifts) {
      for (const uid of shift.assignedVolunteers ?? []) {
        uids.add(uid);
      }
    }
  }
  // 4. Fetch those users
  return getUsersByIds(Array.from(uids));
}
