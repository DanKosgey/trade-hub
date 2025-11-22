import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { supabase } from '../supabase/client';

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

// Function to fetch user-specific rules from database
const fetchUserRulesFromDB = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('trade_rules')
      .select('text')
      .or(`created_by.eq.${userId},created_by.is.null`)
      .order('order_number', { ascending: true });
    
    if (error) throw error;
    
    return data ? data.map((rule: any) => rule.text) : [];
  } catch (error) {
    console.error('Error fetching user rules from DB:', error);
    return [];
  }
};

export const validateTradeWithGemini = async (
  tradeDetails: string, 
  rules: string[],
  imageBase64?: string
): Promise<{ verdict: 'APPROVED' | 'WARNING' | 'REJECTED'; explanation: string }> => {
  if (!API_KEY) {
    return { 
      verdict: 'WARNING', 
      explanation: "Error: API Key not configured. Please set process.env.API_KEY." 
    };
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
      5. Return your response in JSON format with "verdict" and "explanation" fields.
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
        systemInstruction: "You are a strict but encouraging trading mentor. Be concise and focus on risk management. Return your response in JSON format with 'verdict' and 'explanation' fields."
      }
    });

    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(response.text);
      return {
        verdict: jsonResponse.verdict || 'WARNING',
        explanation: jsonResponse.explanation || response.text || "Could not generate a response."
      };
    } catch (parseError) {
      // If JSON parsing fails, return the text as explanation
      return {
        verdict: 'WARNING',
        explanation: response.text || "Could not generate a response."
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      verdict: 'WARNING', 
      explanation: "I'm having trouble analyzing the market right now. Please try again later." 
    };
  }
};

// Enhanced function that fetches user rules from database
export const validateTradeWithGeminiForUser = async (
  userId: string,
  tradeDetails: string, 
  imageBase64?: string
): Promise<{ verdict: 'APPROVED' | 'WARNING' | 'REJECTED'; explanation: string }> => {
  // Fetch user-specific rules from database
  const userRules = await fetchUserRulesFromDB(userId);
  
  // Use the existing validation function with the fetched rules
  return validateTradeWithGemini(tradeDetails, userRules, imageBase64);
};

// AI-powered trade analysis and suggestions
export const analyzeTradePerformance = async (
  tradeHistory: any[],
  userId: string
): Promise<{ insights: string[]; suggestions: string[] }> => {
  if (!API_KEY) {
    return { 
      insights: ["AI analysis unavailable: API Key not configured."],
      suggestions: ["Please contact support to enable AI features."]
    };
  }

  try {
    const modelId = 'gemini-2.5-flash';
    
    // Format trade history for AI analysis
    const formattedTrades = tradeHistory.map((trade, index) => `
      Trade ${index + 1}:
      - Pair: ${trade.pair}
      - Type: ${trade.type}
      - Entry: ${trade.entryPrice}
      - Stop Loss: ${trade.stopLoss}
      - Take Profit: ${trade.takeProfit}
      - Status: ${trade.status}
      - P&L: ${trade.pnl}
      - Strategy: ${trade.strategy || 'Not specified'}
      - Confidence: ${trade.confidenceLevel || 'Not specified'}
      - Notes: ${trade.notes || 'None'}
    `).join('\n');
    
    const prompt = `
      You are an expert Trading Mentor and Data Analyst specializing in performance improvement.
      Analyze the following trade history for a student trader and provide:
      
      1. Key Insights (3-5 bullet points):
         - Performance patterns
         - Strengths
         - Areas for improvement
         
      2. Actionable Suggestions (3-5 bullet points):
         - Specific strategies to improve
         - Risk management tips
         - Psychological factors to consider

      Trade History:
      ${formattedTrades}

      Provide your response in JSON format with "insights" and "suggestions" arrays.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: [{ text: prompt }],
      config: {
        systemInstruction: "You are a helpful trading mentor and data analyst. Provide concise, actionable insights. Return your response in JSON format with 'insights' and 'suggestions' arrays."
      }
    });

    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(response.text);
      return {
        insights: Array.isArray(jsonResponse.insights) ? jsonResponse.insights : ["Could not generate insights."],
        suggestions: Array.isArray(jsonResponse.suggestions) ? jsonResponse.suggestions : ["Could not generate suggestions."]
      };
    } catch (parseError) {
      // If JSON parsing fails, return the text as a single insight
      return {
        insights: [response.text || "Could not generate insights."],
        suggestions: ["Try again later for detailed suggestions."]
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      insights: ["I'm having trouble analyzing your trade performance right now."],
      suggestions: ["Please try again later."]
    };
  }
};