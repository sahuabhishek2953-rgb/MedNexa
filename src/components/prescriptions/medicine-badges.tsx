import type { MedicineItem } from "@/lib/db/schema/index";
import { Pill, Clock, Calendar, AlertCircle } from "lucide-react";

interface MedicineBadgesProps {
  medicines: MedicineItem[];
}

export function MedicineBadges({ medicines }: MedicineBadgesProps) {
  if (!medicines || medicines.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No medicines identified yet.</p>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Medicine Name Badges overview */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
        {medicines.map((med, i) => {
          const isUncertain = med.name.toLowerCase().startsWith("possibly");
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isUncertain
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              {isUncertain ? (
                <AlertCircle className="h-3 w-3 text-amber-600" />
              ) : (
                <Pill className="h-3 w-3 text-blue-600" />
              )}
              {med.name}
            </span>
          );
        })}
      </div>

      {/* Detailed medicine cards */}
      <div className="space-y-2">
        {medicines.map((med, i) => {
          const isUncertain = med.name.toLowerCase().startsWith("possibly");
          return (
            <div
              key={i}
              className={`p-3 rounded-lg border transition-colors ${
                isUncertain
                  ? "bg-amber-50/40 border-amber-100"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">
                    {med.name}
                  </span>
                  {isUncertain && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
                      Uncertain OCR - Check Prescription
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
                {med.dosage && (
                  <span>
                    <strong>Dose:</strong> {med.dosage}
                  </span>
                )}
                {med.frequency && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <strong>Freq:</strong> {med.frequency}
                  </span>
                )}
                {med.duration && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <strong>Duration:</strong> {med.duration}
                  </span>
                )}
              </div>

              {med.instructions && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  Note: {med.instructions}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
