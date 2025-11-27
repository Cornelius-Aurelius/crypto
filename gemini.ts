
import { GoogleGenAI } from "@google/genai";
import { SearchResult, SearchSource, GroundingMetadata, PriceData, MarketOverview } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchCryptoInfo = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a helpful and expert crypto market analyst. Your goal is to explain complex market movements in simple, plain English that anyone can understand. Avoid technical jargon, math formulas, or physics analogies. Focus on 'Buy', 'Sell', 'Hold', 'Risk', and 'Safety'."
      },
    });

    const text = response.text || "No information found.";
    
    // Extract sources from grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    const sources: SearchSource[] = [];

    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      });
    }

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      text,
      sources: uniqueSources,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch crypto information. Please try again.");
  }
};

export const checkCryptoPrices = async (symbols: string[]): Promise<PriceData[]> => {
  if (!symbols || symbols.length === 0) return [];
  
  // Filter out empty strings
  const validSymbols = symbols.filter(s => s && s.trim() !== '');
  if (validSymbols.length === 0) return [];

  try {
    const prompt = `Get the current real-time price in USD for: ${validSymbols.join(', ')}. Return strictly JSON array: [{"symbol": "BTC", "price": 64000.50}].`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let jsonStr = response.text || "[]";
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      // Find the array in the response
      const start = jsonStr.indexOf('[');
      const end = jsonStr.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        jsonStr = jsonStr.substring(start, end + 1);
      }
      
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data)) return data as PriceData[];
      return [];
    } catch (e) {
      console.warn("Failed to parse price data JSON", e);
      return [];
    }

  } catch (error) {
    console.error("Gemini Price Check Error:", error);
    return [];
  }
};

export const getMarketOverview = async (): Promise<MarketOverview | null> => {
  try {
    const prompt = `
      You are an expert crypto analyst AI. Use Google Search to analyze the live crypto market.
      Your goal is to give simple, actionable advice.
      
      STEP 1: ANALYZE KEY FACTORS (Internal Physics Model, Output Simple English):
      1. **Trend Reality (D_KL)**: Is the price hyped up or real? (0-100) -> Label it "Hype vs Reality"
      2. **Volatility**: Is the market calm or crazy? (0-100) -> Label it "Volatility"
      3. **Liquidity**: Is there enough money flowing? (0-100) -> Label it "Market Health"
      4. **Sentiment**: Are people scared or greedy? (0-100) -> Label it "Investor Sentiment"
      
      STEP 2: CALCULATE RISK SCORE (OMEI):
      - **Risk Score** = (D_KL + Vol + Liquidity) - Awareness. Range: -100 (Super Safe/Undervalued) to +100 (High Crash Risk).
      - **Trend**: "Rising Risk", "Accumulation Phase", "Crash Warning", "Safe Growth".
      - **Bottom Signal**: TRUE if the market has bottomed out and is safe to buy.

      STEP 3: IDENTIFY OPPORTUNITIES:
      Find 3 assets with clear signals.
      IMPORTANT: For each asset, provide a "Simplified Analysis" for beginners.
      - Action: STRONG BUY, BUY, HOLD, SELL, STRONG SELL
      - Score: 0 to 100 scale (CRITICAL: 0 = Strong Sell, 50 = Neutral, 100 = Strong Buy). 
      - Human Reason: One simple sentence explaining why (e.g., "Whales are buying, safe to enter" or "Too expensive right now").
      - Physics Rationale: Even in the 'physicsRationale' field, explain it simply. e.g. "Price is rising but volume is low, which is risky."
      
      Return strictly a JSON object:
      {
        "omegaMetrics": {
          "omeiScore": number (-100 to 100),
          "omeiLabel": string (e.g., "High Risk", "Stable", "Great Buying Opportunity"),
          "deltaJ": {
            "trend": "SPIKING" | "RISING" | "NEUTRAL" | "FALLING" | "COLLAPSING",
            "prediction": string (Simple English prediction),
            "isOmegaPoint": boolean
          },
          "components": {
            "d_kl": { "value": number, "label": "Hype Level", "desc": "How much the price is driven by hype vs reality" },
            "volatility": { "value": number, "label": "Volatility", "desc": "How fast prices are changing" },
            "liquidity": { "value": number, "label": "Market Health", "desc": "Ease of buying and selling" },
            "awareness": { "value": number, "label": "Sentiment", "desc": "Current mood of investors" }
          }
        },
        "topOpportunities": [
          {
            "symbol": string,
            "name": string,
            "direction": "LONG" | "SHORT",
            "confidence": number,
            "timeframe": string,
            "entry": string,
            "target": string,
            "stopLoss": string,
            "catalyst": string,
            "prediction": string,
            "physicsRationale": string (Simple explanation of the mechanism),
            "simplifiedAnalysis": {
              "action": "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL",
              "score": number,
              "humanReason": string
            }
          }
        ],
        "liveFeed": [
          { "time": string, "type": "WHALE"|"NEWS"|"ON-CHAIN"|"EXCHANGE"|"OMEGA_SIGNAL", "message": string, "impact": "HIGH"|"MEDIUM"|"LOW" }
        ],
        "marketDrivers": [string]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let jsonStr = response.text || "{}";
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    }

    const data = JSON.parse(jsonStr);
    return {
      ...data,
      timestamp: Date.now()
    } as MarketOverview;

  } catch (error) {
    console.error("Gemini Market Overview Error:", error);
    return null;
  }
};
