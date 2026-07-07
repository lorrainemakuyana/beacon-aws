import { useState, useEffect } from "react";
import { Shift, Event, User } from "@/interfaces";
import { getShiftById } from "@/firebase/services/shifts";
import { getEventById } from "@/firebase/services/events";
import { getUsersByIds } from "@/firebase/services/users";
import { useLoading } from "@/context/LoadingContext";

interface UseShiftDetailResult {
  shift: Shift | null;
  event: Event | null;
  teamUsers: User[];
  error: string | null;
}

export function useShiftDetail(shiftId: string): UseShiftDetailResult {
  const { setLoading } = useLoading();
  const [shift, setShift] = useState<Shift | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const shiftData = await getShiftById(shiftId);
        if (cancelled) return;

        if (!shiftData) {
          setShift(null);
          return;
        }

        const [eventData, users] = await Promise.all([
          getEventById(shiftData.eventId),
          getUsersByIds(shiftData.assignedVolunteers),
        ]);

        if (cancelled) return;

        setShift(shiftData);
        setEvent(eventData);
        setTeamUsers(users);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to load shift");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shiftId]);

  return { shift, event, teamUsers, error };
}
