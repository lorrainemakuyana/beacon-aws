"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { useAuth } from "@/context/auth";
import { useEvent } from "@/context/event-context";
import { getShiftById } from "@/firebase/services/shifts";
import { getUsersByIds } from "@/firebase/services/users";
import { Shift, User } from "@/interfaces";
import Breadcrumb from "@/components/breadcrumb";
import Badge from "@/components/badge";
import EmptyState from "@/components/empty-state";
import { getStatusVariant } from "@/lib/utils";

function formatTimestamp(ts: { toDate?: () => Date; seconds?: number } | undefined): string {
  if (!ts) return "—";
  try {
    const date = typeof ts.toDate === "function" ? ts.toDate() : new Date((ts.seconds ?? 0) * 1000);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export default function ShiftDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id, shiftId } = useParams<{ id: string; shiftId: string }>();
  const { event, loading: eventLoading } = useEvent();

  const [shift, setShift] = useState<Shift | null>(null);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id || !shiftId) return;
    async function load() {
      try {
        const shft = await getShiftById(shiftId);
        setShift(shft);

        if (shft?.assignedVolunteers?.length) {
          const vols = await getUsersByIds(shft.assignedVolunteers);
          setVolunteers(vols);
        }
      } finally {
        setDataLoading(false);
      }
    }
    load();
  }, [user, id, shiftId]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Events", href: "/app/events" },
          { label: eventLoading ? "..." : (event?.title ?? "Event"), href: `/app/events/${id}` },
          { label: "Shifts", href: `/app/events/${id}/shifts` },
          { label: dataLoading ? "..." : (shift?.title ?? "Shift") },
        ]}
      />

      {dataLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading shift...</div>
      ) : shift ? (
        <>
          {/* Shift details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-gray-900">{shift.title}</h1>
              <Badge label={shift.status} variant={getStatusVariant(shift.status)} />
            </div>

            {shift.description && (
              <p className="text-sm text-gray-600">{shift.description}</p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 text-sm">
              {shift.role?.title && (
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Role</span>
                  <span className="text-gray-900">{shift.role.title}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Time</span>
                <span className="text-gray-900">
                  {formatTimestamp(shift.timeSlot?.start as Parameters<typeof formatTimestamp>[0])} –{" "}
                  {formatTimestamp(shift.timeSlot?.end as Parameters<typeof formatTimestamp>[0])}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Volunteers</span>
                <span className="text-gray-900">
                  {shift.assignedVolunteers?.length ?? 0} / {shift.requiredVolunteers} required
                </span>
              </div>
            </div>
          </div>

          {/* Assigned volunteers */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Assigned Volunteers</h2>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {volunteers.length === 0 ? (
                <EmptyState
                  message="No volunteers assigned"
                  description="Volunteers will appear here once they sign up for this shift."
                />
              ) : (
                volunteers.map((vol) => (
                  <div key={vol.uid} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-subtle border border-primary-subtle-border flex items-center justify-center shrink-0">
                      <span className="text-primary text-sm font-semibold">
                        {vol.displayName?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-900 truncate">{vol.displayName}</span>
                      <span className="text-xs text-gray-400 truncate">{vol.email}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="py-12 text-center text-gray-400 text-sm">Shift not found.</div>
      )}
    </div>
  );
}
