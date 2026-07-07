"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth";
import { getAllIncidents } from "@/firebase/services/incidents";
import { Incident, IncidentSeverity } from "@/interfaces";
import Badge from "@/components/badge";
import EmptyState from "@/components/empty-state";
import { formatDate, getStatusVariant, getSeverityVariant } from "@/lib/utils";

const SEVERITY_ORDER: IncidentSeverity[] = ["critical", "high", "medium", "low"];

export default function IncidentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getAllIncidents()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) =>
            SEVERITY_ORDER.indexOf(a.severity) -
            SEVERITY_ORDER.indexOf(b.severity)
        );
        setIncidents(sorted);
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  const openCount = incidents.filter(
    (i) => i.status === "open" || i.status === "investigating"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-500 text-sm mt-1">
            {openCount > 0
              ? `${openCount} active incident${openCount > 1 ? "s" : ""} requiring attention.`
              : "All incidents reported across events."}
          </p>
        </div>
      </div>

      {dataLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Loading incidents...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {incidents.length === 0 ? (
            <EmptyState
              message="No incidents reported"
              description="Incidents reported from the mobile app will appear here."
            />
          ) : (
            incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/app/incidents/${incident.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {incident.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatDate(incident.createdAt)}</span>
                    <span>·</span>
                    <span className="capitalize">{incident.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2 sm:ml-4">
                  <Badge
                    label={incident.severity}
                    variant={getSeverityVariant(incident.severity)}
                  />
                  <Badge
                    label={incident.status}
                    variant={getStatusVariant(incident.status)}
                  />
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
