import { cn } from "@/lib/utils";
import type { PrescriptionStatus } from "@/types";

const statusConfig: Record<
  PrescriptionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-600",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-700",
  },
  review: {
    label: "Review",
    className: "bg-yellow-100 text-yellow-700",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
};

export function StatusBadge({ status }: { status: PrescriptionStatus }) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
