import type { Patient, Prescription } from "@/lib/db/schema/index";
import { formatDate, getInitials } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Pill, Star, ChevronRight } from "lucide-react";

interface PatientDetailProps {
  patient: Patient;
  prescriptions: Prescription[];
}

export function PatientDetail({ patient, prescriptions }: PatientDetailProps) {
  // Sort important prescriptions to top (PRD Page 12)
  const sortedPrescriptions = [...prescriptions].sort((a, b) => {
    if (a.important === b.important) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.important ? -1 : 1;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Link>

      {/* Patient header card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 shrink-0">
            {getInitials(patient.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              {patient.age && <span>{patient.age} years</span>}
              {patient.gender && (
                <span className="capitalize">{patient.gender}</span>
              )}
              {patient.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {patient.phone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {patient.email}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">Registered</p>
            <p className="text-sm font-medium text-gray-700">
              {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>

        {/* Details section */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {patient.address && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Address
              </p>
              <p className="text-sm text-gray-700">{patient.address}</p>
            </div>
          )}
          {patient.allergies && patient.allergies.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Allergies
              </p>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {patient.medicalHistory && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Medical History
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {patient.medicalHistory}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescriptions History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">
            Prescription History ({prescriptions.length})
          </h2>
          <Link
            href="/prescriptions/upload"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + Upload Prescription
          </Link>
        </div>

        {sortedPrescriptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-12 text-center">
            <Pill className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No prescriptions recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedPrescriptions.map((p) => (
              <Link
                key={p.id}
                href={`/prescriptions/${p.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {p.important && (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-gray-900">
                      {p.doctorName ?? "Prescription"}
                    </span>
                    {p.clinicName && (
                      <span className="text-xs text-gray-400">· {p.clinicName}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {p.diagnosis ? `Diagnosis: ${p.diagnosis} · ` : ""}
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
