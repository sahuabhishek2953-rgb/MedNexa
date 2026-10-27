import { createWorker } from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
  }>;
}

/**
 * Runs Tesseract OCR safely on a base64 image string.
 * Gracefully returns empty text if Tesseract worker cannot be initialized.
 */
export async function runOcr(imageBase64: string): Promise<OcrResult> {
  let worker: any = null;
  try {
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    worker = await createWorker("eng", 1, {
      logger: () => {},
    });

    const buffer = Buffer.from(cleanBase64, "base64");
    const { data } = await worker.recognize(buffer);

    return {
      text: data?.text?.trim() || "",
      confidence: Math.round(data?.confidence || 0),
      words: [],
    };
  } catch (error) {
    console.warn("Tesseract OCR fallback warning (non-fatal):", error);
    return {
      text: "",
      confidence: 0,
      words: [],
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore terminate errors
      }
    }
  }
}
