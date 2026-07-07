"use client";
import { createContext, useContext } from "react";
import { Event, Incident, Shift } from "@/interfaces";

export interface EventContextValue {
  event: Event | null;
  shifts: Shift[];
  incidents: Incident[];
  loading: boolean;
  refresh: () => void;
}

export const EventContext = createContext<EventContextValue>({
  event: null,
  shifts: [],
  incidents: [],
  loading: true,
  refresh: () => {},
});

export function useEvent(): EventContextValue {
  return useContext(EventContext);
}
