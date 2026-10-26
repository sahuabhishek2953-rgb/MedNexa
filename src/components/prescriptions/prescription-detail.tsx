"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PrescriptionWithPatient } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { approvePrescription, updatePrescription } from "@/actions/prescriptions";
import { MedicineBadges } from "./medicine-badges";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle,
  Edit2,
  Save,
  X,
  Stethoscope,
  Calendar,
  Tag,
  FileText,
  Activity,
  Star,
  Printer,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import Link from "next/link";

interface PrescriptionDetailProps {
  prescription: PrescriptionWithPatient;
}

export function PrescriptionDetail({ prescription: initial }: PrescriptionDetailProps) {
  const router = useRouter();
  const [prescription, setPrescription] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [isImportant, setIsImportant] = useState(initial.important ?? false);
  const [editData, setEditData] = useState({
    correctedText: initial.correctedText ?? "",
    doctorName: initial.doctorName ?? "",
    clinicName: initial.clinicName ?? "",
    prescriptionDate: initial.prescriptionDate ?? "",
    diagnosis: initial.diagnosis ?? "",
    summary: initial.summary ?? "",
    doctorNotes: initial.doctorNotes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updatePrescription(prescription.id, {
      ...editData,
      important: isImportant,
    });
    if (result.success && result.data) {
      setPrescription((p) => ({ ...p, ...result.data }));
      setEditing(false);
      toast.success("Prescription updated successfully");
      router.refresh();
    } else {
      toast.error("Failed to save changes");
    }
    setSaving(false);
  };

  const handleToggleImportant = async () => {
    const nextImportant = !isImportant;
    setIsImportant(nextImportant);
    const result = await updatePrescription(prescription.id, {
      important: nextImportant,
    });
    if (result.success && result.data) {
      setPrescription((p) => ({ ...p, important: nextImportant }));
      toast.success(
        nextImportant
          ? "Marked as ⭐ Important"
          : "Removed from Important"
      );
      router.refresh();
    } else {
      setIsImportant(!nextImportant);
      toast.error("Failed to update status");
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    const result = await approvePrescription(
      prescription.id,
      editData.doctorNotes
    );
    if (result.success && result.data) {
      setPrescription((p) => ({ ...p, ...result.data }));
      toast.success("Prescription verified and approved!");
      router.refresh();
    } else {
      toast.error("Failed to approve prescription");
    }
    setApproving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const medicines = (prescription.medicines as any[]) ?? [];
  const importantFindings = prescription.importantFindings ?? [];

  // OCR confidence categorization (PRD Page 10)
  const confidence = prescription.ocrConfidence ?? 0;
  let confidenceLabel = "Needs Review";
  let confidenceColor = "text-amber-700 bg-amber-50 border-amber-200";
  let ConfidenceIcon = AlertTriangle;

  if (confidence >= 80) {
    confidenceLabel = "Excellent";
    confidenceColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    ConfidenceIcon = CheckCircle2;
  } else if (confidence >= 60) {
    confidenceLabel = "Good";
    confidenceColor = "text-blue-700 bg-blue-50 border-blue-200";
    ConfidenceIcon = CheckCircle;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/prescriptions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prescriptions
        </Link>

        <div className="flex items-center gap-2">
          {/* Important ⭐ Button (PRD Page 12) */}
          <button
            type="button"
            onClick={handleToggleImportant}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
              isImportant
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Star
              className={`h-4 w-4 ${
                isImportant ? "fill-amber-400 text-amber-500" : "text-gray-400"
              }`}
            />
            {isImportant ? "Important" : "Mark Important"}
          </button>

          {/* Download / Export PDF Report (PRD Page 12) */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4 text-gray-500" />
            Download PDF
          </button>

          {editing ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Record"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4 text-gray-500" /> Edit Record
              </button>

              {prescription.status !== "approved" && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  {approving ? "Approving..." : "Approve & Save"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Prescription Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-xl font-bold text-gray-900">
                {prescription.doctorName || "Prescription Record"}
              </h1>
              <StatusBadge status={prescription.status} />
              {isImportant && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Starred
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Digitized on {formatDateTime(prescription.createdAt)}
              {prescription.patient && (
                <>
                  {" "}· Patient:{" "}
                  <Link
                    href={`/patients/${prescription.patient.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {prescription.patient.name}
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* OCR Quality Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${confidenceColor}`}
          >
            <ConfidenceIcon className="h-4 w-4" />
            <span>
              OCR Quality: {confidenceLabel} ({confidence}%)
            </span>
          </div>
        </div>

        {/* Doctor & Clinic Details */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <InfoField
            icon={Stethoscope}
            label="Doctor"
            value={prescription.doctorName}
            editing={editing}
            inputValue={editData.doctorName}
            onChange={(v) => setEditData((d) => ({ ...d, doctorName: v }))}
          />
          <InfoField
            icon={FileText}
            label="Clinic / Hospital"
            value={prescription.clinicName}
            editing={editing}
            inputValue={editData.clinicName}
            onChange={(v) => setEditData((d) => ({ ...d, clinicName: v }))}
          />
          <InfoField
            icon={Activity}
            label="Diagnosis"
            value={prescription.diagnosis}
            editing={editing}
            inputValue={editData.diagnosis}
            onChange={(v) => setEditData((d) => ({ ...d, diagnosis: v }))}
          />
          <InfoField
            icon={Calendar}
            label="Rx Date"
            value={prescription.prescriptionDate}
            editing={editing}
            inputValue={editData.prescriptionDate}
            onChange={(v) => setEditData((d) => ({ ...d, prescriptionDate: v }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Original Prescription Image & Raw OCR */}
        <div className="space-y-4">
          {/* Image */}
          {prescription.imageUrl && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Original Prescription
                </span>
                {!imageError && !prescription.imageUrl.startsWith("blob:") && (
                  <a
                    href={prescription.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Full View ↗
                  </a>
                )}
              </div>
              <div className="p-2 bg-gray-50 flex items-center justify-center min-h-[160px]">
                {imageError || prescription.imageUrl.startsWith("blob:") ? (
                  <div className="py-8 px-4 text-center flex flex-col items-center justify-center text-gray-500">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Image not available</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      The temporary browser session for this image has expired. Please re-upload to store it permanently on disk.
                    </p>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={prescription.imageUrl}
                    alt="Prescription"
                    onError={() => setImageError(true)}
                    className="w-full object-contain max-h-96 rounded-lg"
                  />
                )}
              </div>
            </div>
          )}

          {/* Raw OCR Text (Preserved verbatim as required by PRD Page 8) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Raw OCR Text (Tesseract)
              </p>
              <span className="text-[10px] text-gray-400 font-mono">
                Unmodified
              </span>
            </div>
            <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto">
              {prescription.rawOcrText || "(No text recognized)"}
            </pre>
          </div>
        </div>

        {/* Right Column: AI Structured Findings, Summary, Medicines, Corrected Text */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Clinical Summary */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1.5">
              AI Clinical Summary
            </p>
            {editing ? (
              <textarea
                value={editData.summary}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, summary: e.target.value }))
                }
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            ) : (
              <p className="text-sm text-blue-950 font-medium leading-relaxed">
                {prescription.summary || "No summary provided."}
              </p>
            )}
          </div>

          {/* Important Findings (PRD Page 13) */}
          {importantFindings.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-rose-800">
                <AlertCircle className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wide">
                  Important Clinical Findings
                </p>
              </div>
              <ul className="space-y-1 pl-4 list-disc text-xs text-rose-900">
                {importantFindings.map((finding, idx) => (
                  <li key={idx} className="font-medium">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medicines Badges & List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Identified Medicines ({medicines.length})
              </h3>
            </div>
            <MedicineBadges medicines={medicines} />
          </div>

          {/* Tags */}
          {prescription.tags && prescription.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Tag className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Prescription Tags
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {prescription.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI-Corrected Text */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                AI-Corrected Prescription Text
              </p>
              {editing && (
                <span className="text-xs text-blue-600">Editing Mode</span>
              )}
            </div>
            {editing ? (
              <textarea
                value={editData.correctedText}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, correctedText: e.target.value }))
                }
                rows={8}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none leading-relaxed"
              />
            ) : (
              <pre className="text-sm text-gray-800 bg-gray-50/70 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap font-sans leading-relaxed">
                {prescription.correctedText || "—"}
              </pre>
            )}
          </div>

          {/* Doctor Review Notes (PRD Page 11) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Doctor&apos;s Personal Notes
            </p>
            {editing ? (
              <textarea
                value={editData.doctorNotes}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, doctorNotes: e.target.value }))
                }
                rows={3}
                placeholder="e.g. Follow-up after 5 days, Increase fluids, Observe fever..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <p className="text-sm text-gray-700">
                {prescription.doctorNotes ? (
                  <span className="italic">&ldquo;{prescription.doctorNotes}&rdquo;</span>
                ) : (
                  <span className="text-gray-400 italic">
                    No doctor notes added yet. Click &apos;Edit Record&apos; to add instructions.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Component ─────────────────────────────────────────────────────────

function InfoField({
  icon: Icon,
  label,
  value,
  editing,
  inputValue,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  inputValue: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-blue-600" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </p>
      </div>
      {editing ? (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-sm font-semibold text-gray-900 truncate">
          {value || "—"}
        </p>
      )}
    </div>
  );
}
