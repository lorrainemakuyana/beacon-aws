"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { getVolunteersForManager } from "@/firebase/services/users";
import { User } from "@/interfaces";
import EmptyState from "@/components/empty-state";

export default function VolunteersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getVolunteersForManager(user.uid)
      .then(setVolunteers)
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        <p className="text-gray-500 text-sm mt-1">
          All registered volunteers in your organization.
        </p>
      </div>

      {dataLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Loading volunteers...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {volunteers.length === 0 ? (
            <EmptyState
              message="No volunteers found"
              description="Volunteers will appear here once they join your organization."
            />
          ) : (
            volunteers.map((vol) => (
              <div
                key={vol.uid}
                className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-subtle border border-primary-subtle-border flex items-center justify-center shrink-0">
                    <span className="text-primary text-sm font-semibold">
                      {vol.displayName?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {vol.displayName}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {vol.email}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1.5">
                  <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                    {vol.role}
                  </span>
                  {vol.skills && vol.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {vol.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-primary-subtle text-primary border border-primary-subtle-border px-2 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {vol.skills.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{vol.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
