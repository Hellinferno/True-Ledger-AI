import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AuditResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * 
 * @param base64Image The base64 encoded string of the original image.
 * @param mimeType The mime type of the image (e.g., 'image/png').
 * @param prompt The text instruction for editing (e.g., "Add a retro filter").
 * @returns A promise that resolves to the edited image base64 string or null if failed.
 */
export const editImageEvidence = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    // Clean base64 string if it contains the header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;

  } catch (error) {
    console.error("Error processing evidence with Gemini:", error);
    throw error;
  }
};

/**
 * Performs a forensic audit analysis using Gemini 3 Pro.
 * 
 * @param ledgerData The parsed CSV data representing the claimed inventory.
 * @param frames An array of base64 encoded strings representing the video frames.
 * @returns A promise that resolves to the AuditResult object.
 */
export const analyzeEvidence = async (
  ledgerData: any[],
  frames: string[]
): Promise<AuditResult> => {
  try {
    // Construct the parts array
    const parts: any[] = [
      { 
        text: `Here is the Uploaded Inventory Ledger (Claimed Data):\n${JSON.stringify(ledgerData, null, 2)}` 
      }
    ];

    // Add image frames
    frames.forEach((frame) => {
      // frames are expected to be data URIs (data:image/jpeg;base64,...), stripping prefix
      const base64Data = frame.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });
      }
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: `You are a Senior Forensic Auditor performing a Test of Details.

Input: You have a Ledger (CSV) claiming certain quantities, and 3 video frames of the actual warehouse.

Task: Count the visible items in the images. Compare them to the CSV quantities.

Logic: If the CSV says '10 Monitors' but you only see 2, that is a Discrepancy.

Output: Return a strict JSON object: { 
  "audit_pass": boolean, 
  "discrepancy_details": string, 
  "risk_score": "High/Med/Low", 
  "financial_impact": string, 
  "auditor_notes": string,
  "findings_data": [
    { "item_name": string, "claimed_qty": number, "actual_qty": number, "status": "MATCH" | "DISCREPANCY" }
  ]
}`,
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AuditResult;
    }

    throw new Error("No response generated from analysis model.");

  } catch (error) {
    console.error("Audit Analysis Failed:", error);
    throw error;
  }
};