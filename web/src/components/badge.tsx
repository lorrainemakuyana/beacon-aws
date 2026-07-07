type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-primary-subtle text-primary border border-primary-subtle-border",
  warning: "bg-warning-subtle text-warning border border-yellow-200",
  danger: "bg-danger-subtle text-danger border border-red-200",
  info: "bg-info-subtle text-info border border-blue-200",
  neutral: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
        variantClasses[variant],
      ].join(" ")}
    >
      {label}
    </span>
  );
}
