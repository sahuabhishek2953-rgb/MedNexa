import Link from "next/link";
import type { Patient } from "@/lib/db/schema/index";
import { formatDate, getInitials } from "@/lib/utils";
import { User, Phone, ChevronRight } from "lucide-react";

interface PatientsTableProps {
  patients: Patient[];
}

export function PatientsTable({ patients }: PatientsTableProps) {
  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 text-center">
        <User className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">No patients found</p>
        <p className="text-xs text-gray-400 mt-1">Register your first patient to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Patient
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Age / Gender
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Contact
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Registered
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                      {getInitials(patient.name)}
                    </div>
                    <span className="font-medium text-gray-900">{patient.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  {patient.age ? `${patient.age} yrs` : "—"}{" "}
                  {patient.gender ? `· ${patient.gender}` : ""}
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  {patient.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">
                  {formatDate(patient.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-0.5 text-xs font-medium"
                  >
                    View <ChevronRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
