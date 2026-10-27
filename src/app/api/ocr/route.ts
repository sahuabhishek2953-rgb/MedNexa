import { NextRequest, NextResponse } from "next/server";
import { processPrescriptionWithAI } from "@/lib/ai/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, imageUrl, rawOcrText = "" } = body;

    let finalBase64 = imageBase64 || "";

    // If base64 was not provided directly but imageUrl was provided, fetch the image buffer
    if (!finalBase64 && imageUrl) {
      try {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const arrayBuf = await imgRes.arrayBuffer();
          finalBase64 = Buffer.from(arrayBuf).toString("base64");
        }
      } catch (fetchErr) {
        console.warn("Failed to fetch imageUrl for OCR:", fetchErr);
      }
    }

    if (!finalBase64 && !rawOcrText) {
      return NextResponse.json(
        { error: "imageBase64 or imageUrl is required" },
        { status: 400 }
      );
    }

    // Strip any data URI header if present
    if (finalBase64.includes(",")) {
      finalBase64 = finalBase64.split(",")[1];
    }

    // Process directly with Gemini Multimodal Vision AI
    const aiResult = await processPrescriptionWithAI(rawOcrText, finalBase64);

    return NextResponse.json({
      success: true,
      ocr: {
        rawText: aiResult.rawOcrText || aiResult.correctedText || "",
        confidence: 96,
      },
      ai: aiResult,
      imageQuality: aiResult.imageQuality || null,
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
