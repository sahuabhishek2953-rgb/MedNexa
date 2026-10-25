import { pgTable, text, timestamp, uuid, jsonb, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "pending",
  "processing",
  "review",
  "approved",
  "rejected",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// ─── Patients ─────────────────────────────────────────────────────────────────

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  age: integer("age"),
  gender: genderEnum("gender"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Prescriptions ────────────────────────────────────────────────────────────

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }),
  
  // Image / file
  imageUrl: text("image_url").notNull(),
  imageKey: text("image_key"),

  // OCR outputs
  rawOcrText: text("raw_ocr_text"),
  ocrConfidence: integer("ocr_confidence"), // 0–100

  // AI-processed output
  correctedText: text("corrected_text"),
  doctorName: text("doctor_name"),
  clinicName: text("clinic_name"),
  prescriptionDate: text("prescription_date"),
  diagnosis: text("diagnosis"),
  notes: text("notes"),

  // Structured medicines (array of MedicineItem)
  medicines: jsonb("medicines").$type<MedicineItem[]>().default([]),

  // Tags & metadata
  tags: text("tags").array().default([]),
  summary: text("summary"),
  importantFindings: text("important_findings").array().default([]),
  important: boolean("important").default(false).notNull(),

  // Image quality checks
  imageQuality: jsonb("image_quality").$type<ImageQualityCheck>(),

  // Workflow
  status: prescriptionStatusEnum("status").default("pending").notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  doctorNotes: text("doctor_notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const patientsRelations = relations(patients, ({ many }) => ({
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

export interface MedicineItem {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
}

export interface ImageQualityCheck {
  isBlurry: boolean;
  blurScore: number;
  isWellLit: boolean;
  brightnessScore: number;
  isAngled: boolean;
  overallScore: number; // 0–100
}
