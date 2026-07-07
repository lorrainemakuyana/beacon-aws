import { useState, useEffect } from "react";
import { Attendance } from "@/interfaces";
import { getUserAttendanceRecords } from "@/firebase/services/attendance";

interface UseUserAttendanceResult {
  attendanceByShift: Record<string, Attendance>;
  loading: boolean;
  error: string | null;
}

export function useUserAttendance(userId: string | undefined): UseUserAttendanceResult {
  const [attendanceByShift, setAttendanceByShift] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getUserAttendanceRecords(userId)
      .then((records) => {
        if (cancelled) return;
        const map: Record<string, Attendance> = {};
        for (const record of records) {
          map[record.shiftId] = record;
        }
        setAttendanceByShift(map);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err.message ?? "Failed to load attendance");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { attendanceByShift, loading, error };
}
