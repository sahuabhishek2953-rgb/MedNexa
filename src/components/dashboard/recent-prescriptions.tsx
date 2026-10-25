import Link from "next/link";
import { getPrescriptions } from "@/actions/prescriptions";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";
import type { Prescription } from "@/lib/db/schema/index";

export async function RecentPrescriptions() {
  const prescriptions = await getPrescriptions();
  const recent = prescriptions.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Recent Prescriptions</h3>
        <Link
          href="/prescriptions"
          className="text-xs text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No prescriptions yet</p>
          <Link
            href="/prescriptions/upload"
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Upload your first prescription →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {recent.map((p: Prescription) => (
            <Link
              key={p.id}
              href={`/prescriptions/${p.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {p.doctorName ?? "Unknown Doctor"}
                </p>
                <p className="text-xs text-gray-400">
                  {p.diagnosis ?? "No diagnosis"} · {formatDate(p.createdAt)}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
