import { GoogleGenAI } from "@google/genai";
import { ProcessedImage } from "../types";
import { REPORT_TEMPLATE } from "../constants";

// =======================================
// CONFIG
// =======================================
const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyCIISCak2mzCsGW85aZdXTAWk1NXm984Hs";

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY }); // FIX → Hapus vertexai:true

// =======================================
// UTIL: Convert base64 dataURL → Gemini inlineData object
// =======================================
const dataUrlToGeminiPart = (dataUrl: string) => {
  const [header, base64Data] = dataUrl.split(",");
  const mimeType = header.split(":")[1].split(";")[0];

  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

// =======================================
// MAIN FUNCTION: Generate ZWDS Report
// =======================================
export const generateZwdReport = async (
  images: ProcessedImage[],
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key missing. Set GEMINI_API_KEY env variable.");
  }

  const model = "gemini-2.5-flash";

  const systemInstruction = `
You are a world-class expert in Zi Wei Dou Shu (ZWDS) astrology. Your task is to analyze a series of 13 images that make up a complete ZWDS chart. One image is the central information box, and the other 12 are the palaces. You must meticulously extract all required information from these images and populate the provided template.

Instructions:
1. Identify the central information box among the 13 images. Use it to fill out the "Basic Information" and "Natal LQKJ" sections of the report.
2. Then identify each of the 12 palaces (Self, Parents, Mental, Property, Career, Friends, Travel, Health, Wealth, Children, Spouse, Siblings).
3. For each palace, fill in all fields in the template (Stem/Branch, Active Stars, LQKJ, Fei Hua, etc.)
4. Follow the template exactly.
5. Match palace names (EN/ID) correctly.
6. If a field is unclear → write "[Information not found in image]".
7. Transcribe Chinese characters accurately.
8. Output ONLY the completed report text with no extra commentary.
`;

  const imageParts = images.map((img) => dataUrlToGeminiPart(img.dataUrl));

  const contents = {
    role: "user",
    parts: [
      ...imageParts,
      {
        text: `Analyze these ZWDS chart images and fill this template:\n\n${REPORT_TEMPLATE}`,
      },
    ],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      },
    });

    return response.text || "[No response content received]";
  } catch (e) {
    console.error("❌ Error calling Gemini API:", e);

    if (e instanceof Error) {
      return `Error generating report: ${e.message}`;
    }
    return "Unknown error occurred while generating the report.";
  }
};
