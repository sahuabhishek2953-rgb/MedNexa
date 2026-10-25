import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPrescriptionById } from "@/actions/prescriptions";
import { PrescriptionDetail } from "@/components/prescriptions/prescription-detail";

export const metadata: Metadata = { title: "Prescription Details" };

export default async function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prescription = await getPrescriptionById(id);

  if (!prescription) notFound();

  return <PrescriptionDetail prescription={prescription} />;
}
