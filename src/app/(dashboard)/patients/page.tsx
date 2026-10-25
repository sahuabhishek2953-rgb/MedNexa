import type { Metadata } from "next";
import { getPatients } from "@/actions/patients";
import { PatientsTable } from "@/components/patients/patients-table";
import { AddPatientButton } from "@/components/patients/add-patient-button";
import { SearchInput } from "@/components/shared/search-input";

export const metadata: Metadata = { title: "Patients" };

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const patients = await getPatients(search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <AddPatientButton />
      </div>

      <SearchInput placeholder="Search by name or phone..." defaultValue={search} />

      <PatientsTable patients={patients} />
    </div>
  );
}
