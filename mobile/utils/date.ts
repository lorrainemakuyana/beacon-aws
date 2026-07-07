import { Timestamp } from "firebase/firestore";

export function getGreeting(date: Date) {
  const hour = date.getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
export function formatDate(date: Date | Timestamp) {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function calculateDayStreak(
  lastActive: number,
  existingStreak?: number,
): number {
  if (!lastActive) return 0;

  const last = new Date(lastActive);
  const now = new Date();

  // Normalize to local midnight
  const lastMidnight = new Date(
    last.getFullYear(),
    last.getMonth(),
    last.getDate(),
  );

  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const diffDays = Math.floor(
    (todayMidnight.getTime() - lastMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );

  // 🔥 Core streak rules
  if (diffDays === 0) {
    // active today → keep streak
    return existingStreak ?? 1;
  }

  if (diffDays === 1) {
    // active yesterday → increment
    return (existingStreak ?? 0) + 1;
  }

  // missed a day → reset
  return 0;
}
