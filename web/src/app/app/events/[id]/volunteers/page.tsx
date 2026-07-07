"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth";
import { useEvent } from "@/context/event-context";
import { getUsersByIds } from "@/firebase/services/users";
import { User } from "@/interfaces";
import EmptyState from "@/components/empty-state";

export default function EventVolunteersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { shifts, loading: eventLoading } = useEvent();

  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (eventLoading || !user) return;
    const volunteerIds = Array.from(new Set(shifts.flatMap((s) => s.assignedVolunteers ?? [])));
    getUsersByIds(volunteerIds)
      .then(setVolunteers)
      .finally(() => setDataLoading(false));
  }, [user, shifts, eventLoading]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (eventLoading || dataLoading) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">Loading volunteers...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900">Volunteers</h2>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {volunteers.length === 0 ? (
          <EmptyState
            message="No volunteers assigned"
            description="Volunteers will appear here once they sign up for shifts."
          />
        ) : (
          volunteers.map((vol) => (
            <div key={vol.uid} className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
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
              {vol.skills && vol.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {vol.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {vol.skills.length > 3 && (
                    <span className="text-xs text-gray-400">+{vol.skills.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
