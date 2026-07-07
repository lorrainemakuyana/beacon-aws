import { useState, useEffect } from "react";
import { Event } from "@/interfaces";
import { getEventById } from "@/firebase/services/events";
import { useLoading } from "@/context/LoadingContext";

interface UseEventDetailResult {
  event: Event | null;
  error: string | null;
}

export function useEventDetail(eventId: string): UseEventDetailResult {
  const { setLoading } = useLoading();
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getEventById(eventId)
      .then((data) => { if (!cancelled) setEvent(data); })
      .catch((err) => { if (!cancelled) setError(err.message ?? "Failed to load event"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [eventId]);

  return { event, error };
}
