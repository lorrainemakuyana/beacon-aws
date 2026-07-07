import { useState, useEffect } from "react";
import { Attendance, Event } from "@/interfaces";
import {
  getActiveCheckIn,
  verifyEventCode,
  checkInToShift,
  checkOutFromShift,
} from "@/firebase/services/attendance";
import { getEventById } from "@/firebase/services/events";

export function useCheckIn(userId: string | undefined) {
  const [activeCheckIn, setActiveCheckIn] = useState<Attendance | null>(null);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getActiveCheckIn(userId).then(async (record) => {
      if (cancelled) return;
      if (record) {
        const event = await getEventById(record.eventId);
        if (cancelled) return;
        const eventEnded =
          event && new Date(`${event.date}T${event.endTime}`) < new Date();
        if (eventEnded) {
          await checkOutFromShift(record.id);
        } else {
          setActiveCheckIn(record);
          setActiveEvent(event);
        }
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [userId]);

  const handleCheckIn = async (code: string): Promise<void> => {
    if (!userId) throw new Error("Not authenticated.");
    setSubmitting(true);
    try {
      const result = await verifyEventCode(code, userId);
      if (!result) throw new Error("Invalid code or you are not assigned to this event.");
      await checkInToShift(userId, result.shift.id, result.event.id);
      const record = await getActiveCheckIn(userId);
      setActiveCheckIn(record);
      setActiveEvent(result.event);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (): Promise<void> => {
    if (!activeCheckIn) return;
    setSubmitting(true);
    try {
      await checkOutFromShift(activeCheckIn.id);
      setActiveCheckIn(null);
      setActiveEvent(null);
    } finally {
      setSubmitting(false);
    }
  };

  return { activeCheckIn, activeEvent, loading, submitting, handleCheckIn, handleCheckOut };
}
