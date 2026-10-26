"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertTriangle,
  User,
  Sparkles,
  Info,
} from "lucide-react";
import { fileToBase64, bytesToMB } from "@/lib/utils";
import { createPrescription, updatePrescription } from "@/actions/prescriptions";
import type { Patient, ImageQualityCheck } from "@/lib/db/schema/index";
import type { OcrProcessingState } from "@/types";

interface UploadPrescriptionFormProps {
  patients?: Patient[];
}

export function UploadPrescriptionForm({ patients = [] }: UploadPrescriptionFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patientId, setPatientId] = useState("");
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [processing, setProcessing] = useState<OcrProcessingState>({
    step: "idle",
    progress: 0,
    message: "",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setQualityWarning(null);
    setProcessing({ step: "idle", progress: 0, message: "" });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleProcess = async () => {
    if (!file || !preview) return;

    try {
      // Step 1: Upload image file permanently to server storage
      setProcessing({
        step: "uploading",
        progress: 15,
        message: "Storing prescription image securely...",
      });

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to upload image file");
      }

      const uploadData = await uploadRes.json();
      const persistentImageUrl: string = uploadData.url;

      const base64 = await fileToBase64(file);

      // Step 2: Create initial record with persistent image URL
      setProcessing({
        step: "uploading",
        progress: 30,
        message: "Registering upload with MedNexa...",
      });
      const createResult = await createPrescription({
        patientId: patientId || undefined,
        imageUrl: persistentImageUrl,
        imageKey: uploadData.fileName || file.name,
      });

      if (!createResult.success || !createResult.data) {
        throw new Error("Failed to initialize prescription record");
      }

      const prescriptionId = createResult.data.id;

      // Step 3: Run OCR & Gemini AI pipeline
      setProcessing({
        step: "ocr",
        progress: 55,
        message: "Extracting raw text with Tesseract OCR...",
      });

      setProcessing({
        step: "ai",
        progress: 75,
        message: "Gemini Flash refining OCR, medicines & clinical tags...",
      });

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, analyzeQuality: true }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "OCR & AI pipeline failed");
      }

      const result = await response.json();
      const { ocr, ai, imageQuality } = result;

      // Image quality warning check (Phase 2)
      if (imageQuality) {
        const warnings: string[] = [];
        if (imageQuality.isBlurry) warnings.push("Image appears slightly blurry");
        if (!imageQuality.isWellLit) warnings.push("Lighting may be too dim");
        if (imageQuality.isAngled) warnings.push("Prescription is angled or tilted");
        if (warnings.length > 0) {
          setQualityWarning(warnings.join(" · "));
        }
      }

      // Step 4: Persist all structured data
      setProcessing({
        step: "ai",
        progress: 90,
        message: "Saving structured records...",
      });

      const updateRes = await updatePrescription(prescriptionId, {
        status: "review",
        rawOcrText: ocr?.rawText ?? "",
        ocrConfidence: ocr?.confidence ?? 0,
        correctedText: ai?.correctedText ?? "",
        doctorName: ai?.doctorName ?? null,
        clinicName: ai?.clinicName ?? null,
        prescriptionDate: ai?.prescriptionDate ?? null,
        diagnosis: ai?.diagnosis ?? null,
        summary: ai?.summary ?? "",
        medicines: ai?.medicines ?? [],
        importantFindings: ai?.importantFindings ?? [],
        tags: ai?.tags ?? [],
        imageQuality: imageQuality as ImageQualityCheck,
      });

      if (!updateRes.success) {
        console.error("updatePrescription issue:", updateRes.error);
      }

      setProcessing({
        step: "done",
        progress: 100,
        message: "Extraction complete! Opening review view...",
      });
      toast.success("Prescription digitized! Ready for doctor review.");

      setTimeout(() => {
        router.push(`/prescriptions/${prescriptionId}`);
      }, 700);
    } catch (error: any) {
      console.error(error);
      setProcessing({
        step: "error",
        progress: 0,
        message: error?.message || "Processing failed. Please try again.",
      });
      toast.error("Failed to process prescription image");
    }
  };

  const isProcessing = ["uploading", "ocr", "ai"].includes(processing.step);

  return (
    <div className="space-y-6">
      {/* Patient Selection Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <User className="h-4 w-4 text-blue-600" />
          Assign to Patient
          <span className="text-xs font-normal text-gray-400">(Optional)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={isProcessing}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Select Existing Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.phone ? `(${p.phone})` : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 flex items-center">
            {patients.length > 0
              ? `${patients.length} patients registered. You can also link or create later.`
              : "No patients registered yet. You can create one from the Patients tab."}
          </p>
        </div>
      </div>

      {/* Dropzone Card */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors bg-white ${
          isDragActive
            ? "border-blue-500 bg-blue-50/50"
            : preview
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Prescription preview"
              className="max-h-72 mx-auto rounded-lg object-contain shadow-sm border border-gray-100"
            />
            <div className="text-sm font-medium text-gray-700">
              {file?.name}{" "}
              <span className="text-xs text-gray-400">
                ({bytesToMB(file?.size ?? 0)})
              </span>
            </div>
            <p className="text-xs text-blue-600 font-medium">
              Click or drag another image to replace
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {isDragActive
                  ? "Drop prescription image here"
                  : "Upload Prescription Image"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Drag and drop, or browse your files (JPG, PNG, WebP up to 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Quality Warning (Phase 2) */}
      {qualityWarning && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold">Image Quality Notice:</span>{" "}
            {qualityWarning}. If recognition accuracy seems low, you can retake the photo with steady lighting and upload again.
          </div>
        </div>
      )}

      {/* Processing Status Card */}
      {processing.step !== "idle" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              {processing.step === "done" ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : processing.step === "error" ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              )}
              {processing.message}
            </div>
            <span className="text-xs text-gray-500 font-semibold">
              {processing.progress}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                processing.step === "error"
                  ? "bg-red-500"
                  : processing.step === "done"
                  ? "bg-emerald-500"
                  : "bg-blue-600"
              }`}
              style={{ width: `${processing.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={handleProcess}
        disabled={!file || isProcessing}
        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing & Digitizing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Run OCR & AI Digitization
          </>
        )}
      </button>
    </div>
  );
}
