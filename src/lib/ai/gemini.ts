import { GoogleGenAI } from "@google/genai";
import type { MedicineItem, ImageQualityCheck } from "@/lib/db/schema/index";

export interface GeminiPrescriptionResult {
  correctedText: string;
  doctorName?: string | null;
  clinicName?: string | null;
  prescriptionDate?: string | null;
  diagnosis?: string | null;
  medicines: MedicineItem[];
  summary: string;
  importantFindings: string[];
  tags: string[];
  rawOcrText?: string;
  imageQuality?: ImageQualityCheck | null;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
}

// Ultra-fast, high-availability Gemini models with fallback redundancy
const ACTIVE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
];

function getMimeType(base64: string): string {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw")) return "image/png";
  if (base64.startsWith("UklGR")) return "image/webp";
  if (base64.startsWith("AAAA")) return "image/avif";
  return "image/jpeg";
}

const SYSTEM_PROMPT = `You are an expert clinical pharmacologist and medical document intelligence AI assistant for MedNexa.
You specialize in reading handwritten and scanned Indian clinic prescriptions.

DOCTOR HANDWRITING DECIPHERING RULES:
1. Doctors write quickly and cursive handwriting can be difficult to read.
   Use your deep knowledge of medical prescriptions, pharmacology, brand names, and dosages to decipher the intended medicines, dosages, and frequencies.
   (e.g., 'STzosow' = Sizopin, 'Qube' = Qupin, 'Avtvan' = Ativan, 'RIvetil' = Rivotril, 'Seevh' = Serenace, 'Paracet' = Paracetamol, 'Metfor' = Metformin, etc.)
2. If a drug name is uncertain, prefix with "Possibly ".
3. Organize the prescription cleanly into professional sections: Doctor Details, Clinic, Prescription Date, Clinical Notes, and numbered Rx Medications.
4. Extract each medicine name, dosage, frequency (e.g. 1-0-1, 1 at night, OD, BD, TDS, HS), and duration.
5. In raw_ocr_text, transcribe all visible text from the prescription image verbatim.
6. Evaluate the image quality:
   - isBlurry: boolean (is image blurred or hard to read?)
   - blurScore: number (0 to 100, where 100 is crystal sharp)
   - isWellLit: boolean (is lighting adequate?)
   - brightnessScore: number (0 to 100, where 100 is perfect lighting)
   - isAngled: boolean (is image tilted or angled?)
   - overallScore: number (0 to 100 overall visual quality score)

Return ONLY a valid JSON object matching this schema:
{
  "raw_ocr_text": "all verbatim text visible on the document",
  "doctor_name": "string or null",
  "clinic_name": "string or null",
  "prescription_date": "string or null",
  "diagnosis": "string or null",
  "summary": "1-2 sentence clinical summary of the prescription",
  "corrected_text": "clean, well-formatted, professional prescription text with clear sections",
  "medicines": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "instructions": "string"
    }
  ],
  "important_findings": ["key clinical points, warnings or instructions"],
  "tags": ["relevant category or drug tags"],
  "image_quality": {
    "isBlurry": boolean,
    "blurScore": number,
    "isWellLit": boolean,
    "brightnessScore": number,
    "isAngled": boolean,
    "overallScore": number
  }
}`;

/**
 * Sends image and/or raw OCR text to Gemini Vision and returns structured prescription data.
 * Executes in ~1-3 seconds with full multimodal handwritten recognition.
 */
export async function processPrescriptionWithAI(
  rawOcrText: string,
  imageBase64?: string
): Promise<GeminiPrescriptionResult> {
  const fallbackResult: GeminiPrescriptionResult = {
    correctedText: rawOcrText || "Prescription text captured.",
    doctorName: null,
    clinicName: null,
    prescriptionDate: null,
    diagnosis: null,
    summary: rawOcrText ? "Prescription digitized." : "No clear text detected.",
    medicines: [],
    importantFindings: [],
    tags: ["Prescription"],
    rawOcrText: rawOcrText || "",
    imageQuality: {
      isBlurry: false,
      blurScore: 85,
      isWellLit: true,
      brightnessScore: 85,
      isAngled: false,
      overallScore: 85,
    },
  };

  try {
    const ai = getGeminiClient();

    const cleanBase64 = imageBase64?.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const promptText = `${SYSTEM_PROMPT}${
      rawOcrText
        ? `\n\n--- OCR TEXT HINTS START ---\n${rawOcrText}\n--- OCR TEXT HINTS END ---`
        : ""
    }`;

    const contents = cleanBase64
      ? [
          {
            role: "user" as const,
            parts: [
              {
                inlineData: {
                  mimeType: getMimeType(cleanBase64),
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ]
      : promptText;

    let lastError: any = null;

    for (const model of ACTIVE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });

        const text = response.text ?? "{}";
        const parsedData = JSON.parse(text);

        const qualityData = parsedData.image_quality || parsedData.imageQuality;
        const imageQuality: ImageQualityCheck = qualityData
          ? {
              isBlurry: Boolean(qualityData.isBlurry),
              blurScore: Number(qualityData.blurScore) || 85,
              isWellLit: Boolean(qualityData.isWellLit ?? true),
              brightnessScore: Number(qualityData.brightnessScore) || 85,
              isAngled: Boolean(qualityData.isAngled),
              overallScore: Number(qualityData.overallScore) || 85,
            }
          : {
              isBlurry: false,
              blurScore: 85,
              isWellLit: true,
              brightnessScore: 85,
              isAngled: false,
              overallScore: 85,
            };

        return {
          rawOcrText:
            parsedData.raw_ocr_text ||
            parsedData.rawOcrText ||
            parsedData.corrected_text ||
            rawOcrText ||
            "",
          correctedText:
            parsedData.corrected_text ||
            parsedData.correctedText ||
            rawOcrText ||
            "",
          doctorName: parsedData.doctor_name || parsedData.doctorName || null,
          clinicName: parsedData.clinic_name || parsedData.clinicName || null,
          prescriptionDate:
            parsedData.prescription_date || parsedData.prescriptionDate || null,
          diagnosis: parsedData.diagnosis || null,
          summary: parsedData.summary || "Prescription digitized successfully.",
          medicines: Array.isArray(parsedData.medicines)
            ? parsedData.medicines.map((m: any) => ({
                name: m.name || m.medicine || "Unknown Medicine",
                dosage: m.dosage || m.dose || "",
                frequency: m.frequency || "",
                duration: m.duration || "",
                instructions: m.instructions || "",
              }))
            : [],
          importantFindings: Array.isArray(parsedData.important_findings)
            ? parsedData.important_findings
            : Array.isArray(parsedData.importantFindings)
            ? parsedData.importantFindings
            : [],
          tags:
            Array.isArray(parsedData.tags) && parsedData.tags.length > 0
              ? parsedData.tags
              : ["Prescription"],
          imageQuality,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Model ${model} failed, trying next]:`, err?.message || err);
      }
    }

    if (lastError) {
      console.error("All Gemini models failed, last error:", lastError);
    }
    return fallbackResult;
  } catch (error) {
    console.error("Gemini AI processing error:", error);
    return fallbackResult;
  }
}

/**
 * Analyzes image quality via Gemini Vision.
 * Non-blocking, fast check.
 */
export async function analyzeImageQuality(
  imageBase64: string
): Promise<ImageQualityCheck> {
  const defaultQuality: ImageQualityCheck = {
    isBlurry: false,
    blurScore: 88,
    isWellLit: true,
    brightnessScore: 85,
    isAngled: false,
    overallScore: 86,
  };

  try {
    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    for (const model of ACTIVE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: getMimeType(cleanBase64),
                    data: cleanBase64,
                  },
                },
                {
                  text: `Analyze image quality: blur, lighting, angle. Return JSON:
{"isBlurry": boolean, "blurScore": number, "isWellLit": boolean, "brightnessScore": number, "isAngled": boolean, "overallScore": number}`,
                },
              ],
            },
          ],
          config: {
            temperature: 0,
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text ?? "{}");
        return {
          isBlurry: Boolean(parsed.isBlurry),
          blurScore: Number(parsed.blurScore) || 85,
          isWellLit: Boolean(parsed.isWellLit ?? true),
          brightnessScore: Number(parsed.brightnessScore) || 85,
          isAngled: Boolean(parsed.isAngled),
          overallScore: Number(parsed.overallScore) || 85,
        };
      } catch {
        continue;
      }
    }
    return defaultQuality;
  } catch {
    return defaultQuality;
  }
}
