import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPatientById } from "@/actions/patients";
import { getPrescriptions } from "@/actions/prescriptions";
import { PatientDetail } from "@/components/patients/patient-detail";

export const metadata: Metadata = { title: "Patient Details" };

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [patient, prescriptions] = await Promise.all([
    getPatientById(id),
    getPrescriptions(id),
  ]);

  if (!patient) notFound();

  return <PatientDetail patient={patient} prescriptions={prescriptions} />;
}
