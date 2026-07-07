import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { Incident, COLLECTIONS } from "@/interfaces";

export function useUserIncidents(userId?: string) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const q = query(
      collection(firestore, COLLECTIONS.INCIDENTS),
      where("reporterId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Incident));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  return { incidents, loading };
}
