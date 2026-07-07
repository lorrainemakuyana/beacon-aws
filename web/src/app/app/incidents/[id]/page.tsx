"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import {
  getIncidentById,
  updateIncidentStatus,
} from "@/firebase/services/incidents";
import { Incident, IncidentStatus } from "@/interfaces";
import Breadcrumb from "@/components/breadcrumb";
import Badge from "@/components/badge";
import { formatDate, getStatusVariant, getSeverityVariant } from "@/lib/utils";

const STATUS_FLOW: { status: IncidentStatus; label: string; readOnly?: boolean }[] = [
  { status: "open", label: "Open" },
  { status: "investigating", label: "Investigating" },
  { status: "resolved", label: "Resolved" },
  { status: "closed", label: "Closed" },
  { status: "archived", label: "Archived", readOnly: true },
];

export default function IncidentDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    getIncidentById(id)
      .then(setIncident)
      .finally(() => setDataLoading(false));
  }, [user, id]);

  async function handleStatusUpdate(newStatus: IncidentStatus) {
    if (!incident || updating) return;
    setUpdating(true);
    try {
      await updateIncidentStatus(id, newStatus);
      setIncident((prev) => prev ? { ...prev, status: newStatus, updatedAt: Date.now() } : prev);
      toast.success(`Status updated to ${newStatus}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (!dataLoading && !incident) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <p className="text-gray-500 text-sm">Incident not found.</p>
        <Link
          href="/app/incidents"
          className="text-primary text-sm hover:underline"
        >
          Back to Incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Incidents", href: "/app/incidents" },
          { label: dataLoading ? "..." : (incident?.title ?? "Incident") },
        ]}
      />

      {dataLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Loading incident...
        </div>
      ) : incident ? (
        <>
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-xl font-bold text-gray-900">
                {incident.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  label={incident.severity}
                  variant={getSeverityVariant(incident.severity)}
                />
                <Badge
                  label={incident.status}
                  variant={getStatusVariant(incident.status)}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600">{incident.description}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 text-sm">
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">
                  Category
                </span>
                <span className="text-gray-900 capitalize">
                  {incident.category}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">
                  Severity
                </span>
                <span className="text-gray-900 capitalize">
                  {incident.severity}
                </span>
              </div>
              {incident.location && (
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">
                    Location
                  </span>
                  <span className="text-gray-900">{incident.location}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">
                  Reported
                </span>
                <span className="text-gray-900">
                  {formatDate(incident.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">
                  Last Updated
                </span>
                <span className="text-gray-900">
                  {formatDate(incident.updatedAt)}
                </span>
              </div>
              {incident.eventId && (
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">
                    Event
                  </span>
                  <Link
                    href={`/app/events/${incident.eventId}`}
                    className="text-primary text-sm hover:underline"
                  >
                    View Event
                  </Link>
                </div>
              )}
            </div>

            {incident.resolution && (
              <div className="bg-primary-subtle border border-primary-subtle-border rounded-lg p-4">
                <span className="text-xs uppercase tracking-wide text-primary font-semibold block mb-1">
                  Resolution
                </span>
                <p className="text-sm text-gray-700">{incident.resolution}</p>
              </div>
            )}

            {/* Photos */}
            {incident.photos && incident.photos.length > 0 && (
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wide mb-2">
                  Photos
                </span>
                <div className="flex flex-wrap gap-2">
                  {incident.photos.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Incident photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Update Status
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {STATUS_FLOW.filter(({ status, readOnly }) =>
                !readOnly || incident.status === status
              ).map(({ status, label, readOnly }) => {
                const isCurrent = incident.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => !readOnly && handleStatusUpdate(status)}
                    disabled={isCurrent || updating || readOnly}
                    className={[
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      isCurrent
                        ? "bg-primary text-white border-primary cursor-default"
                        : readOnly
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-default"
                        : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed",
                    ].join(" ")}
                  >
                    {isCurrent && <span className="mr-1.5 text-xs">✓</span>}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
