import { collection, doc, writeBatch } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { dummyEvents } from "@/constants/dummy_events";
import { dummyShifts } from "@/constants/dummy_shifts";
import { dummyUsers } from "@/constants/dummy_users";
import { COLLECTIONS } from "@/interfaces";

export async function seedDatabase(): Promise<void> {
  const batch = writeBatch(firestore);

  for (const event of dummyEvents) {
    batch.set(doc(collection(firestore, COLLECTIONS.EVENTS), event.id), event);
  }

  for (const shift of dummyShifts) {
    batch.set(doc(collection(firestore, COLLECTIONS.SHIFTS), shift.id), shift);
  }

  for (const user of dummyUsers) {
    batch.set(doc(collection(firestore, COLLECTIONS.USERS), user.uid), user);
  }

  await batch.commit();
}
