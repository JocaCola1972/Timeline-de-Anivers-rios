
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });

export async function resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function validateHumanImage(base64Image: string): Promise<{ isHuman: boolean; reason: string }> {
  // Remove data:image/jpeg;base64, prefix
  const base64Data = base64Image.split(',')[1];
  
  try {
    // Aligned with Google GenAI SDK guidelines: using contents: { parts: [...] }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: 'Analisa esta imagem. Ela contém uma fotografia clara de um ser humano adequada para um perfil? Responde apenas em formato JSON: {"isHuman": boolean, "reason": "string em português"}.',
          },
        ],
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{"isHuman": false, "reason": "Erro na análise"}');
    return result;
  } catch (error) {
    console.error("Erro ao validar imagem:", error);
    return { isHuman: false, reason: "Não foi possível validar na imagem no momento." };
  }
}
