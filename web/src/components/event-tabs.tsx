"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  eventId: string;
  counts: { shifts: number; volunteers: number; incidents: number };
}

const tabs = [
  { key: "shifts", label: "Shifts", path: "shifts" },
  { key: "volunteers", label: "Volunteers", path: "volunteers" },
  { key: "incidents", label: "Incidents", path: "incidents" },
] as const;

export default function EventTabs({ eventId, counts }: Props) {
  const pathname = usePathname();

  function getActiveTab(): "shifts" | "volunteers" | "incidents" {
    if (pathname.includes("/volunteers")) return "volunteers";
    if (pathname.includes("/incidents")) return "incidents";
    return "shifts";
  }

  const active = getActiveTab();

  return (
    <div className="overflow-x-auto border-b border-gray-200">
      <div className="flex items-center gap-4 sm:gap-6 min-w-max">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={`/app/events/${eventId}/${tab.path}`}
            className={[
              "pb-2 text-sm font-medium border-b-2 transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {tab.label}{" "}
            <span className="text-xs ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
              {counts[tab.key]}
            </span>
          </Link>
        );
      })}
      </div>
    </div>
  );
}
