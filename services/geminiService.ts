
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Menganalisis laporan kunjungan untuk membantu Kepala Bidang.
 */
export const analyzeReport = async (findings: string, recommendations: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Bertindaklah sebagai Pakar Manajemen Pendidikan di Dinas Pendidikan.
      
      TEMUAN PENGAWAS: ${findings}
      REKOMENDASI PENGAWAS: ${recommendations}
      
      Tugas Anda:
      1. Berikan analisis kritis terhadap temuan ini (apakah ini masalah sistemik atau insidental).
      2. Berikan saran tindak lanjut administratif yang konkret untuk Kepala Bidang.
      3. Prediksi urgensi masalah (Skala 1-10).
      
      Format output: Gunakan poin-poin yang profesional dalam Bahasa Indonesia yang formal.`,
      config: {
        systemInstruction: "Anda adalah asisten cerdas untuk Kepala Bidang di Dinas Pendidikan.",
        temperature: 0.6,
      },
    });

    // Fix: Access .text property directly and trim.
    return response.text?.trim() ?? "AI tidak dapat memproses analisis saat ini.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Gagal melakukan analisis AI.";
  }
};

/**
 * Membantu pengawas menyusun narasi laporan.
 */
export const suggestReportContent = async (context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Berdasarkan konteks kunjungan sekolah berikut: "${context}", susunlah narasi laporan resmi yang mencakup:
      - Findings: Temuan lapangan yang terperinci dan profesional.
      - Recommendations: Rekomendasi solusi yang konkret.
      
      Kembalikan dalam format JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: { 
              type: Type.STRING,
              description: 'Temuan lapangan yang terperinci.'
            },
            recommendations: { 
              type: Type.STRING,
              description: 'Rekomendasi solusi yang konkret.'
            }
          },
          propertyOrdering: ["findings", "recommendations"]
        }
      }
    });

    // Fix: Access .text property and trim before parsing JSON.
    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return null;
  }
};
