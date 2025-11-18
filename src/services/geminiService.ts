import { GoogleGenAI } from "@google/genai";
import { ProcessedImage } from "../types";
import { REPORT_TEMPLATE } from "../constants";

const API_KEY = "AIzaSyCIISCak2mzCsGW85aZdXTAWk1NXm984Hs";
if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

const dataUrlToGeminiPart = (dataUrl: string) => {
  const base64Data = dataUrl.split(",")[1];
  const mimeType = dataUrl.split(";")[0].split(":")[1];
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const generateZwdReport = async (
  images: ProcessedImage[],
): Promise<string> => {
  if (!API_KEY) {
    throw new Error(
      "Gemini API Key is not configured. Please ensure the API_KEY environment variable is set.",
    );
  }

  const model = "gemini-2.5-flash";

  const systemInstruction = `You are a world-class expert in Zi Wei Dou Shu (ZWDS) astrology. Your task is to analyze a series of 13 images that make up a complete ZWDS chart. One image is the central information box, and the other 12 are the palaces. You must meticulously extract all required information from these images and populate the provided template.

  **Instructions:**
  1.  First, identify the central information box among the 13 images. Use it to fill out the "Basic Information" and "Natal LQKJ" sections of the report.
  2.  Then, identify each of the 12 palace boxes (Self, Parents, Mental, Property, Career, Friends, Travel, Health, Wealth, Children, Spouse, Siblings). The palace name is usually at the top of its box.
  3.  For each of the 12 palaces, fill in all the sub-fields in the template (Stem/Branch, Active Stars, LQKJ, Fei Hua, etc.) based on the content of that palace's image.
  4.  Fill in the template precisely. Do not deviate from the template structure.
  5.  The palace names in the template are in English and Indonesian. Match your findings to the correct section.
  6.  If information for a specific field is not visible or available in the images, explicitly state "[Information not found in image]". Do not leave fields blank or remove them.
  7.  Pay close attention to Chinese characters, stems, branches, and star names. Transcribe them accurately.
  8.  The final output must be ONLY the completed report text. Do not include any introductory or concluding remarks outside of the template.`;

  const imageParts = images.map((img) => dataUrlToGeminiPart(img.dataUrl));

  const contents = {
    role: "user",
    parts: [
      ...imageParts,
      {
        text: `Analyze the provided ZWDS chart images and fill out this template completely:\n\n${REPORT_TEMPLATE}`,
      },
    ],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (e) {
    console.error("Error calling Gemini API:", e);
    if (e instanceof Error) {
      return `Error generating report: ${e.message}. Please check your API key and network connection.`;
    }
    return "An unknown error occurred while generating the report.";
  }
};
