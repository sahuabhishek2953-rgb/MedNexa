"use server";

import { db } from "@/lib/db";
import { prescriptions, patients } from "@/lib/db/schema/index";
import { eq, desc, count, and, gte } from "drizzle-orm";
import {
  UpdatePrescriptionSchema,
  type UpdatePrescriptionInput,
} from "@/lib/validations";

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getPrescriptions(patientId?: string) {
  if (patientId) {
    return db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt));
  }
  return db.select().from(prescriptions).orderBy(desc(prescriptions.createdAt));
}

export async function getPrescriptionById(id: string) {
  const result = await db.query.prescriptions.findFirst({
    where: eq(prescriptions.id, id),
    with: { patient: true },
  });
  return result ?? null;
}

export async function createPrescription(data: {
  patientId?: string;
  imageUrl: string;
  imageKey?: string;
  rawOcrText?: string;
  ocrConfidence?: number;
}) {
  const [prescription] = await db
    .insert(prescriptions)
    .values({ ...data, status: "pending" })
    .returning();
  return { success: true as const, data: prescription };
}

export async function updatePrescription(
  id: string,
  input: UpdatePrescriptionInput
) {
  const parsed = UpdatePrescriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const [updated] = await db
    .update(prescriptions)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(prescriptions.id, id))
    .returning();

  return { success: true as const, data: updated };
}

export async function approvePrescription(id: string, doctorNotes?: string) {
  const [updated] = await db
    .update(prescriptions)
    .set({
      status: "approved",
      isVerified: true,
      verifiedAt: new Date(),
      doctorNotes,
      updatedAt: new Date(),
    })
    .where(eq(prescriptions.id, id))
    .returning();
  return { success: true as const, data: updated };
}

export async function deletePrescription(id: string) {
  await db.delete(prescriptions).where(eq(prescriptions.id, id));
  return { success: true as const };
}

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    [{ total: totalPatients }],
    [{ total: totalPrescriptions }],
    [{ total: pendingReviews }],
    [{ total: approvedToday }],
  ] = await Promise.all([
    db.select({ total: count() }).from(patients),
    db.select({ total: count() }).from(prescriptions),
    db
      .select({ total: count() })
      .from(prescriptions)
      .where(eq(prescriptions.status, "review")),
    db
      .select({ total: count() })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.status, "approved"),
          gte(prescriptions.verifiedAt, today)
        )
      ),
  ]);

  return {
    totalPatients: Number(totalPatients),
    totalPrescriptions: Number(totalPrescriptions),
    pendingReviews: Number(pendingReviews),
    approvedToday: Number(approvedToday),
  };
}
