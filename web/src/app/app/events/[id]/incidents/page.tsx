"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth";
import { useEvent } from "@/context/event-context";
import Badge from "@/components/badge";
import EmptyState from "@/components/empty-state";
import { formatDate, getStatusVariant, getSeverityVariant } from "@/lib/utils";

export default function EventIncidentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { incidents, loading: eventLoading } = useEvent();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (eventLoading) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">Loading incidents...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">Incidents</h2>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {incidents.length === 0 ? (
          <EmptyState
            message="No incidents reported"
            description="Incidents for this event will appear here."
          />
        ) : (
          incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/app/incidents/${incident.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">{incident.title}</span>
                <span className="text-xs text-gray-400">{formatDate(incident.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Badge label={incident.severity} variant={getSeverityVariant(incident.severity)} />
                <Badge label={incident.status} variant={getStatusVariant(incident.status)} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
