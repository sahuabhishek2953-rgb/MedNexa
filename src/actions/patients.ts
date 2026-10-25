"use server";

import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema/index";
import { eq, ilike, or, desc } from "drizzle-orm";
import {
  CreatePatientSchema,
  type CreatePatientInput,
} from "@/lib/validations";

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createPatient(input: CreatePatientInput) {
  const parsed = CreatePatientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const { allergies: allergiesRaw, ...rest } = parsed.data;
  const allergyArray = allergiesRaw
    ? allergiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  const [patient] = await db
    .insert(patients)
    .values({ ...rest, allergies: allergyArray })
    .returning();

  return { success: true as const, data: patient };
}

export async function getPatients(search?: string) {
  if (search) {
    return db
      .select()
      .from(patients)
      .where(
        or(
          ilike(patients.name, `%${search}%`),
          ilike(patients.phone, `%${search}%`)
        )
      )
      .orderBy(desc(patients.createdAt));
  }
  return db.select().from(patients).orderBy(desc(patients.createdAt));
}

export async function getPatientById(id: string) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, id));
  return patient ?? null;
}

export async function updatePatient(
  id: string,
  input: Partial<CreatePatientInput>
) {
  const { allergies: allergiesRaw, ...rest } = input;

  const allergyArray = allergiesRaw
    ? allergiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : undefined;

  const [updated] = await db
    .update(patients)
    .set({
      ...rest,
      ...(allergyArray !== undefined ? { allergies: allergyArray } : {}),
      updatedAt: new Date(),
    })
    .where(eq(patients.id, id))
    .returning();

  return { success: true as const, data: updated };
}

export async function deletePatient(id: string) {
  await db.delete(patients).where(eq(patients.id, id));
  return { success: true as const };
}
