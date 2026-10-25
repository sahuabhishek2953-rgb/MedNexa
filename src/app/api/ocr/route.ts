import { NextRequest, NextResponse } from "next/server";
import { runOcr } from "@/lib/ocr/tesseract";
import { processPrescriptionWithAI, analyzeImageQuality } from "@/lib/ai/gemini";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, analyzeQuality = false } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 is required" },
        { status: 400 }
      );
    }

    // Step 1: Run OCR and Image Quality check in parallel for maximum speed
    const [ocrResult, imageQuality] = await Promise.all([
      runOcr(imageBase64).catch((err) => {
        console.error("Tesseract OCR error:", err);
        return { text: "", confidence: 0, words: [] as any[] };
      }),
      analyzeQuality
        ? analyzeImageQuality(imageBase64).catch(() => null)
        : Promise.resolve(null),
    ]);

    // Step 2: Send OCR text + image to Gemini for structured extraction
    const aiResult = await processPrescriptionWithAI(ocrResult.text, imageBase64);

    return NextResponse.json({
      success: true,
      ocr: {
        rawText: ocrResult.text || "",
        confidence: ocrResult.confidence || 0,
      },
      ai: aiResult,
      imageQuality,
    });
  } catch (error: any) {
    console.error("[OCR API] Critical failure:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to process prescription image",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
