
import { GoogleGenAI } from "@google/genai";

// Aligned with Google GenAI SDK guidelines: initializing with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDailyHoroscope(westernSign: string, chineseSign: string): Promise<{ western: string; chinese: string }> {
  try {
    const prompt = `Gera um horóscopo curto e positivo para hoje em Português de Portugal para os seguintes signos:
    - Signo Ocidental: ${westernSign}
    - Signo Chinês: ${chineseSign}
    
    Responde apenas em formato JSON: {"western": "previsão ocidental curta", "chinese": "previsão chinesa curta"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text || '{"western": "As estrelas reservam um dia calmo.", "chinese": "O equilíbrio trará prosperidade."}');
  } catch (error) {
    console.error("Erro ao gerar horóscopo:", error);
    return {
      western: "Foca-te nas tuas energias positivas hoje.",
      chinese: "A paciência será a tua melhor aliada."
    };
  }
}
