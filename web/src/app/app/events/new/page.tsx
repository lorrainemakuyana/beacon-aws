"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { createEvent } from "@/firebase/services/events";
import Breadcrumb from "@/components/breadcrumb";

interface ShiftRow {
  title: string;
  requiredVolunteers: number;
}

export default function NewEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // Organizer
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgTitle, setOrgTitle] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");

  // Shifts
  const [shifts, setShifts] = useState<ShiftRow[]>([{ title: "", requiredVolunteers: 1 }]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setOrgName(user.displayName ?? "");
      setOrgEmail(user.email ?? "");
      setShowOrganizer(true);
    }
  }, [user]);

  function addShift() {
    setShifts((prev) => [...prev, { title: "", requiredVolunteers: 1 }]);
  }

  function removeShift(index: number) {
    setShifts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateShift(index: number, field: keyof ShiftRow, value: string | number) {
    setShifts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (shifts.length === 0) {
      toast.error("At least one shift is required.");
      return;
    }

    for (const s of shifts) {
      if (!s.title.trim()) {
        toast.error("All shift roles must have a title.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const eventData = {
        title,
        description,
        location,
        address,
        date,
        startTime,
        endTime,
        status,
        shifts: [],
        coordinators: [user!.uid],
        collaborators: [],
        organizationId: "",
        eventCode: crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(),
        ...(showOrganizer && orgName
          ? {
              organizer: {
                name: orgName,
                title: orgTitle,
                email: orgEmail,
                phone: orgPhone,
              },
            }
          : {}),
      };

      const id = await createEvent(eventData, shifts);
      toast.success("Event created successfully.");
      router.push(`/app/events/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6"
    >
      <Breadcrumb
        items={[
          { label: "Events", href: "/app/events" },
          { label: "New Event" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details for your new event.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-gray-900">Event Details</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              placeholder="Community Cleanup Drive"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
              placeholder="Describe the event..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                placeholder="Central Park"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                placeholder="123 Main St, New York, NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center gap-6">
              {(["draft", "published"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-gray-700 capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Organizer section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setShowOrganizer((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-base font-semibold text-gray-900">Organizer Details</h2>
            <span className="text-sm text-primary">{showOrganizer ? "Hide" : "Add"}</span>
          </button>

          {showOrganizer && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="Jane Smith"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={orgTitle}
                  onChange={(e) => setOrgTitle(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="Event Coordinator"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="jane@example.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Shifts section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Shifts / Roles</h2>
            <button
              type="button"
              onClick={addShift}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-light font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {shifts.map((shift, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  value={shift.title}
                  onChange={(e) => updateShift(index, "title", e.target.value)}
                  placeholder="Role / Shift title"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                <input
                  type="number"
                  min={1}
                  value={shift.requiredVolunteers}
                  onChange={(e) => updateShift(index, "requiredVolunteers", parseInt(e.target.value, 10) || 1)}
                  className="w-full sm:w-24 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="Volunteers"
                />
                <button
                  type="button"
                  onClick={() => removeShift(index)}
                  disabled={shifts.length === 1}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/app/events")}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
