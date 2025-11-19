import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini
// NOTE: In a real app, this would be imported from a secure config
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

const API_KEY = getApiKey();
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const validateTradeWithGemini = async (
  tradeDetails: string, 
  rules: string[],
  imageBase64?: string
): Promise<string> => {
  if (!API_KEY) {
    return "Error: API Key not configured. Please set process.env.API_KEY.";
  }

  try {
    const modelId = 'gemini-2.5-flash';
    
    const ruleText = rules.map((r, i) => `${i + 1}. ${r}`).join('\n');
    
    const prompt = `
      You are an expert Trading Mentor specializing in CRT (Candle Range Theory) and Fair Value Gaps (FVG).
      Your job is to validate a student's trade setup based on specific rules.
      
      Here are the strict rules the student must follow:
      ${ruleText}

      Student's Trade Details:
      ${tradeDetails}

      Analyze the setup. 
      1. Check against every rule.
      2. If an image is provided, analyze the chart structure, liquidity sweeps, and FVGs.
      3. Give a final verdict: APPROVED, WARNING, or REJECTED.
      4. Explain why in a helpful, educational tone.
    `;

    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      // Remove header if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction: "You are a strict but encouraging trading mentor. Be concise and focus on risk management."
      }
    });

    return response.text || "Could not generate a response.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble analyzing the market right now. Please try again later.";
  }
};