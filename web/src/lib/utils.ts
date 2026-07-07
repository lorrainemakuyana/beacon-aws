export function formatDate(ts: number | string): string {
  if (!ts) return "—";
  let date: Date;
  if (typeof ts === "number") {
    date = new Date(ts);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(ts)) {
    // Parse date-only strings as local time to avoid UTC offset shifting the day
    const [y, m, d] = ts.split("-").map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(ts);
  }
  if (isNaN(date.getTime())) return String(ts);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(ts: string): string {
  if (!ts) return "—";
  // ts is expected to be an ISO string or HH:MM format
  const date = new Date(`1970-01-01T${ts}`);
  if (isNaN(date.getTime())) {
    // Try parsing as full ISO string
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusVariant(
  status: string
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status.toLowerCase()) {
    case "active":
    case "published":
    case "attended":
    case "checked-in":
      return "success";
    case "draft":
    case "open":
      return "info";
    case "full":
    case "investigating":
      return "warning";
    case "cancelled":
    case "missed":
      return "danger";
    case "completed":
    case "closed":
    case "checked-out":
    case "archived":
      return "neutral";
    default:
      return "neutral";
  }
}

export function getSeverityVariant(
  severity: string
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (severity.toLowerCase()) {
    case "critical":
      return "danger";
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "neutral";
  }
}
