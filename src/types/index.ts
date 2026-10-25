import type { Patient, Prescription, MedicineItem, ImageQualityCheck } from "@/lib/db/schema/index";

// Re-export DB types for convenience
export type { Patient, Prescription, MedicineItem, ImageQualityCheck };

// ─── UI / Component Types ─────────────────────────────────────────────────────

export type PrescriptionStatus =
  | "pending"
  | "processing"
  | "review"
  | "approved"
  | "rejected";

export interface PrescriptionWithPatient extends Prescription {
  patient: Patient | null;
}

export interface DashboardStats {
  totalPatients: number;
  totalPrescriptions: number;
  pendingReviews: number;
  approvedToday: number;
}

export interface UploadedFile {
  file: File;
  preview: string;
  base64: string;
}

export interface OcrProcessingState {
  step: "idle" | "uploading" | "ocr" | "ai" | "done" | "error";
  progress: number;
  message: string;
}
