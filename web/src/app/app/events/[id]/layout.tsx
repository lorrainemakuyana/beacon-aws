"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { EventContext } from "@/context/event-context";
import { toast } from "sonner";
import { getEventById, archiveEvent, unarchiveEvent, deleteEvent, addCollaboratorToEvent } from "@/firebase/services/events";
import { getShiftsByEventId } from "@/firebase/services/shifts";
import { getIncidentsByEventId } from "@/firebase/services/incidents";
import { getUsersByIds } from "@/firebase/services/users";
import { Event, Incident, Shift, User } from "@/interfaces";
import Breadcrumb from "@/components/breadcrumb";
import Badge from "@/components/badge";
import EventTabs from "@/components/event-tabs";
import { formatDate, getStatusVariant } from "@/lib/utils";

export default function EventLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // archive / unarchive confirm state
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  // delete confirm state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // collaborator state
  const [collabEmail, setCollabEmail] = useState("");
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabUsers, setCollabUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [evt, shfts, incs] = await Promise.all([
      getEventById(id),
      getShiftsByEventId(id),
      getIncidentsByEventId(id),
    ]);
    setEvent(evt);
    setShifts(shfts);
    setIncidents(incs);
    if (evt?.collaborators?.length) {
      getUsersByIds(evt.collaborators).then(setCollabUsers);
    } else {
      setCollabUsers([]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (user && id) load();
  }, [user, id, load]);

  async function handleUnarchive() {
    if (!id) return;
    setUnarchiving(true);
    try {
      await unarchiveEvent(id);
      toast.success("Event restored to published.");
      load();
    } catch {
      toast.error("Failed to unarchive event.");
    } finally {
      setUnarchiving(false);
    }
  }

  async function handleArchive() {
    if (!id) return;
    setArchiving(true);
    try {
      await archiveEvent(id);
      toast.success("Event archived.");
      setArchiving(false);
      router.push("/app/events");
    } catch {
      toast.error("Failed to archive event.");
      setArchiving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteEvent(id);
      toast.success("Event deleted.");
    } catch {
      toast.error("Failed to delete event.");
      setDeleting(false);
      return;
    }
    router.push("/app/events");
  }

  async function handleAddCollaborator(e: React.FormEvent) {
    e.preventDefault();
    if (!collabEmail.trim() || !id) return;
    setCollabLoading(true);
    const result = await addCollaboratorToEvent(id, collabEmail.trim());
    if (result.success) {
      toast.success(result.message);
      setCollabEmail("");
      load();
    } else {
      toast.error(result.message);
    }
    setCollabLoading(false);
  }

  // unique volunteer count from shifts
  const volunteerCount = new Set(shifts.flatMap((s) => s.assignedVolunteers ?? [])).size;

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <EventContext.Provider value={{ event, shifts, incidents, loading, refresh: load }}>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Events", href: "/app/events" },
            { label: loading ? "..." : (event?.title ?? "Event") },
          ]}
        />

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading event...</div>
        ) : !event ? (
          <div className="flex flex-col items-center gap-3 py-32">
            <p className="text-gray-500 text-sm">Event not found.</p>
            <Link href="/app/events" className="text-primary text-sm hover:underline">Back to Events</Link>
          </div>
        ) : (
          <>
            {/* Event info card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge label={event.status} variant={getStatusVariant(event.status)} />

                  {/* Archive / Unarchive */}
                  {event.status === "archived" ? (
                    <button
                      onClick={handleUnarchive}
                      disabled={unarchiving}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 border border-gray-200 rounded-md hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      <ArchiveRestore className="w-3.5 h-3.5" />
                      {unarchiving ? "Restoring…" : "Unarchive"}
                    </button>
                  ) : (
                    confirmArchive ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Archive?</span>
                        <button onClick={handleArchive} disabled={archiving} className="text-xs text-orange-600 font-medium hover:underline disabled:opacity-50">Yes</button>
                        <button onClick={() => setConfirmArchive(false)} className="text-xs text-gray-500 hover:underline">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setConfirmArchive(true); setConfirmDelete(false); }}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 border border-gray-200 rounded-md hover:border-orange-300 hover:text-orange-500 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>
                    )
                  )}

                  {/* Delete — permanently removes event + shifts + incidents */}
                  {confirmDelete ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Delete permanently?</span>
                      <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-600 font-medium hover:underline disabled:opacity-50">Yes</button>
                      <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:underline">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setConfirmDelete(true); setConfirmArchive(false); }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 border border-gray-200 rounded-md hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Date</span>
                  <span className="text-gray-900">{formatDate(event.date)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Time</span>
                  <span className="text-gray-900">{event.startTime} – {event.endTime}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Location</span>
                  <span className="text-gray-900">{event.location}</span>
                </div>
                {event.address && (
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Address</span>
                    <span className="text-gray-900">{event.address}</span>
                  </div>
                )}
                {event.eventCode && (
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wide mb-0.5">Event Code</span>
                    <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{event.eventCode}</span>
                  </div>
                )}
              </div>

              {event.organizer && (
                <div className="border-t border-gray-100 pt-4">
                  <span className="text-gray-400 block text-xs uppercase tracking-wide mb-2">Organizer</span>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{event.organizer.name}</p>
                    {event.organizer.title && <p className="text-gray-500">{event.organizer.title}</p>}
                    {event.organizer.email && <p className="text-gray-400 text-xs">{event.organizer.email}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Collaborators */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Collaborators</h2>
              <form onSubmit={handleAddCollaborator} className="flex gap-2">
                <input
                  type="email"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  placeholder="collaborator@email.com"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                <button
                  type="submit"
                  disabled={collabLoading || !collabEmail.trim()}
                  className="px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </form>
              {collabUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collabUsers.map((u) => (
                    <span key={u.uid} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {u.displayName || u.email}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <EventTabs
              eventId={id}
              counts={{ shifts: shifts.length, volunteers: volunteerCount, incidents: incidents.length }}
            />
          </>
        )}

        {/* Tab content */}
        {!loading && event && children}
      </div>
    </EventContext.Provider>
  );
}
