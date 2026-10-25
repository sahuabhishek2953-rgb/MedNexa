import type { Metadata } from "next";
import { UploadPrescriptionForm } from "@/components/prescriptions/upload-prescription-form";
import { getPatients } from "@/actions/patients";

export const metadata: Metadata = { title: "Upload Prescription" };

export default async function UploadPrescriptionPage() {
  const patients = await getPatients();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Prescription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a photo of a handwritten prescription. Our AI will extract and
          structure the information for your review.
        </p>
      </div>
      <UploadPrescriptionForm patients={patients} />
    </div>
  );
}
