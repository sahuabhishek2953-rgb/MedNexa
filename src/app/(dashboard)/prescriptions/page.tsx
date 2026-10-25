import type { Metadata } from "next";
import { getPrescriptions } from "@/actions/prescriptions";
import { PrescriptionsTable } from "@/components/prescriptions/prescriptions-table";
import type { Prescription } from "@/lib/db/schema/index";
import Link from "next/link";
import { Upload } from "lucide-react";

export const metadata: Metadata = { title: "Prescriptions" };

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const prescriptions = await getPrescriptions();

  const filtered = status
    ? prescriptions.filter((p: Prescription) => p.status === status)
    : prescriptions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} prescription{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/prescriptions/upload"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Prescription
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "review", "approved", "rejected"].map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/prescriptions" : `/prescriptions?status=${s}`}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              (s === "all" && !status) || status === s
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <PrescriptionsTable prescriptions={filtered} />
    </div>
  );
}
