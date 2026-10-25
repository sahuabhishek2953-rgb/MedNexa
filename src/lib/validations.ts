import { z } from "zod";

export const CreatePatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().int().min(0).max(150).nullish(),
  gender: z.enum(["male", "female", "other"]).nullish(),
  phone: z.string().nullish(),
  email: z.string().email().nullish().or(z.literal("")),
  address: z.string().nullish(),
  medicalHistory: z.string().nullish(),
  allergies: z.string().nullish(),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;

export const MedicineItemSchema = z.object({
  name: z.string().default(""),
  dosage: z.string().nullish(),
  frequency: z.string().nullish(),
  duration: z.string().nullish(),
  instructions: z.string().nullish(),
});

export const ImageQualityCheckSchema = z.object({
  isBlurry: z.boolean().default(false),
  blurScore: z.number().default(85),
  isWellLit: z.boolean().default(true),
  brightnessScore: z.number().default(85),
  isAngled: z.boolean().default(false),
  overallScore: z.number().default(85),
});

export const UpdatePrescriptionSchema = z.object({
  correctedText: z.string().nullish(),
  doctorName: z.string().nullish(),
  clinicName: z.string().nullish(),
  prescriptionDate: z.string().nullish(),
  diagnosis: z.string().nullish(),
  notes: z.string().nullish(),
  doctorNotes: z.string().nullish(),
  summary: z.string().nullish(),
  medicines: z.array(MedicineItemSchema).nullish(),
  importantFindings: z.array(z.string()).nullish(),
  tags: z.array(z.string()).nullish(),
  imageQuality: ImageQualityCheckSchema.nullish(),
  ocrConfidence: z.number().nullish(),
  rawOcrText: z.string().nullish(),
  important: z.boolean().optional(),
  status: z
    .enum(["pending", "processing", "review", "approved", "rejected"])
    .optional(),
  isVerified: z.boolean().optional(),
});

export type UpdatePrescriptionInput = z.infer<typeof UpdatePrescriptionSchema>;
