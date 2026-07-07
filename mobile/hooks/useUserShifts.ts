import { useState, useEffect } from "react";
import { Shift, Event } from "@/interfaces";
import { getShiftsForUser } from "@/firebase/services/shifts";
import { getEventsByIds } from "@/firebase/services/events";
import { useLoading } from "@/context/LoadingContext";

interface UseUserShiftsResult {
  shifts: Shift[];
  eventsMap: Record<string, Event>;
  error: string | null;
}

export function useUserShifts(userId: string | undefined): UseUserShiftsResult {
  const { setLoading } = useLoading();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, Event>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const userShifts = await getShiftsForUser(userId);
        if (cancelled) return;

        const eventIds = [...new Set(userShifts.map((s) => s.eventId))];
        const events = await getEventsByIds(eventIds);
        if (cancelled) return;

        const map: Record<string, Event> = {};
        for (const e of events) map[e.id] = e;

        setShifts(
          userShifts.sort(
            (a, b) =>
              a.timeSlot.start.toMillis() - b.timeSlot.start.toMillis(),
          ),
        );
        setEventsMap(map);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to load shifts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { shifts, eventsMap, error };
}
