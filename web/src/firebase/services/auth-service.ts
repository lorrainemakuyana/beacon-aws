import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/config";
import { COLLECTIONS } from "@/interfaces";

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(firestore, COLLECTIONS.USERS, cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName,
    role: "coordinator",
    createdAt: Date.now(),
    lastActive: Date.now(),
    skills: [],
    events: [],
  });
}
