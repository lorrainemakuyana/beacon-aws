import { addDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "@/firebase/config";
import { Incident, COLLECTIONS } from "@/interfaces";

export async function reportIncident(
  data: Omit<Incident, "id" | "status" | "createdAt" | "updatedAt">
): Promise<string> {
  const payload = Object.fromEntries(
    Object.entries({ ...data, status: "open", createdAt: Date.now(), updatedAt: Date.now() })
      .filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(collection(firestore, COLLECTIONS.INCIDENTS), payload);
  return docRef.id;
}

export async function getUserIncidents(userId: string): Promise<Incident[]> {
  const q = query(
    collection(firestore, COLLECTIONS.INCIDENTS),
    where("reporterId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Incident));
}

export async function uploadIncidentPhoto(
  userId: string,
  uri: string,
  index: number
): Promise<string> {
  const filename = `${Date.now()}_${index}`;
  const storageRef = ref(storage, `incidents/${userId}/${filename}`);
  const response = await fetch(uri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
