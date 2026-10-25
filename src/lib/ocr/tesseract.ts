import { createWorker } from "tesseract.js";
import path from "path";

export interface OcrResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
  }>;
}

/**
 * Runs Tesseract OCR on a base64 image string with explicit Node worker path.
 * This prevents Next.js/Turbopack bundling resolution errors on Windows.
 */
export async function runOcr(imageBase64: string): Promise<OcrResult> {
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "tesseract.js",
    "src",
    "worker-script",
    "node",
    "index.js"
  );

  let worker;
  try {
    worker = await createWorker("eng", 1, {
      workerPath,
      logger: () => {},
    });

    const buffer = Buffer.from(imageBase64, "base64");
    const { data } = await worker.recognize(buffer);

    // Extract word details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allWords: Array<{ text: string; confidence: number }> = (data as any)
      .blocks
      ?.flatMap((b: any) =>
        b.paragraphs?.flatMap((par: any) =>
          par.lines?.flatMap((line: any) =>
            (line.words ?? []).map((w: any) => ({
              text: w.text as string,
              confidence: Math.round(w.confidence as number),
            }))
          )
        )
      ) ?? [];

    return {
      text: data.text?.trim() || "",
      confidence: Math.round(data.confidence) || 0,
      words: allWords,
    };
  } catch (error) {
    console.error("Tesseract OCR execution error:", error);
    return {
      text: "",
      confidence: 0,
      words: [],
    };
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
  }
}
