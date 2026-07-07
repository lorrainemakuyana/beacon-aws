"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/auth";
import { getManagerEvents } from "@/firebase/services/events";
import { Event } from "@/interfaces";
import Badge from "@/components/badge";
import EmptyState from "@/components/empty-state";
import { formatDate, getStatusVariant } from "@/lib/utils";

const listVariants = {
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export default function EventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getManagerEvents(user.uid)
      .then(setEvents)
      .finally(() => setDataLoading(false));
  }, [user]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 text-sm mt-1">
            All events in your organization.
          </p>
        </div>
        <Link
          href="/app/events/new"
          className="flex items-center gap-2 bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {dataLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            message="No events found"
            description="Events will appear here once they are created."
          />
        ) : (
          <motion.div initial="hidden" animate="visible" variants={listVariants}>
            {events.map((event) => (
              <motion.div key={event.id} variants={itemVariants} transition={{ duration: 0.2 }}>
                <Link
                  href={`/app/events/${event.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {event.title}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(event.date)}</span>
                      <span>·</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <Badge
                      label={event.status}
                      variant={getStatusVariant(event.status)}
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
