import {
  collection,
  getDocs,
  query,
  where,
  documentId,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, firestore } from "@/firebase/config";
import { User, COLLECTIONS } from "@/interfaces";
import { User as FirebaseUser } from "firebase/auth";

export const getUser = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(firestore, COLLECTIONS.USERS, uid));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    return null;
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return null;
  }
};

export const updateUser = async (
  uid: string,
  updates: Partial<User>,
): Promise<void> => {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      ...updates,
      lastActive: Date.now(),
    });
  } catch (error: any) {
    console.error("Update user profile error:", error);
    throw new Error("Failed to update profile. Please try again.");
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) return [];
  const results: User[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const chunk = ids.slice(i, i + 30);
    const q = query(
      collection(firestore, COLLECTIONS.USERS),
      where(documentId(), "in", chunk),
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => results.push(d.data() as User));
  }
  return results;
}
