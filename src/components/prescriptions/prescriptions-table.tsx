import Link from "next/link";
import type { Prescription } from "@/lib/db/schema/index";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { FileText, ChevronRight, Star } from "lucide-react";

interface PrescriptionsTableProps {
  prescriptions: Prescription[];
}

export function PrescriptionsTable({ prescriptions }: PrescriptionsTableProps) {
  if (prescriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-700">No prescriptions found</p>
        <p className="text-xs text-gray-400 mt-1">Upload a prescription to digitize it</p>
        <Link
          href="/prescriptions/upload"
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Upload Prescription
        </Link>
      </div>
    );
  }

  // Sort important prescriptions to top as requested in PRD Page 12
  const sorted = [...prescriptions].sort((a, b) => {
    if (a.important === b.important) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.important ? -1 : 1;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Doctor / Clinic
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Diagnosis & Summary
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                OCR Quality
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Date
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((p) => {
              const conf = p.ocrConfidence ?? 0;
              let qualityText = "Needs Review";
              let qualityColor = "text-amber-600";
              let barColor = "bg-amber-500";

              if (conf >= 80) {
                qualityText = "Excellent";
                qualityColor = "text-emerald-600";
                barColor = "bg-emerald-500";
              } else if (conf >= 60) {
                qualityText = "Good";
                qualityColor = "text-blue-600";
                barColor = "bg-blue-500";
              }

              return (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {p.important && (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {p.doctorName ?? "Prescription"}
                        </p>
                        {p.clinicName && (
                          <p className="text-xs text-gray-400">{p.clinicName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-xs">
                    <p className="font-medium text-gray-800 truncate">
                      {p.diagnosis || "No specific diagnosis"}
                    </p>
                    {p.summary && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {p.summary}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {p.ocrConfidence != null ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${conf}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${qualityColor}`}>
                            {conf}%
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                          {qualityText}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <Link
                      href={`/prescriptions/${p.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View & Review <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
