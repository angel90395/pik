
import { GoogleGenAI, Type } from "@google/genai";
import { MushroomAttribute, MushroomCategory, MushroomRoom } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBattleTip = async (category: MushroomCategory, attribute?: MushroomAttribute): Promise<string> => {
  try {
    const attrInfo = attribute ? `且屬性為「${attribute}」` : "";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `身為皮克敏專家，請針對挑戰「${category}」類型${attrInfo}的蘑菇，提供一段簡短（30字以內）的戰鬥策略建議。`,
      config: {
        systemInstruction: "你是一個皮克敏 Bloom 的資深戰術顧問。",
        temperature: 0.7,
      },
    });
    return response.text || "派出你最強的皮克敏，一起加油吧！";
  } catch (error) {
    return "為了勝利，集結同色皮克敏吧！";
  }
};

export const fetchGlobalRegistryPosts = async (): Promise<MushroomRoom[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "請模擬生成 5 則皮克敏 Bloom 蘑菇戰鬥的全球邀請資訊。包含暱稱、12位好友代碼、蘑菇類型、屬性、徵求人數。請以 JSON 格式回傳。",
      config: {
        systemInstruction: "你是一個皮克敏社群伺服器，負責生成全球模擬戰況。請確保暱稱來自不同國家，代碼格式為 12 位數字。屬性請使用：電, 水, 水晶, 火, 毒, 藍, 粉, 黃, 紅, 冰, 白。類型請使用：巨大, 一般活動, 一般, 小, 一般屬性, 大屬性。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nickname: { type: Type.STRING },
              friendCode: { type: Type.STRING },
              category: { type: Type.STRING },
              attribute: { type: Type.STRING },
              slots: { type: Type.NUMBER },
              participantsCount: { type: Type.NUMBER },
            },
            required: ["nickname", "friendCode", "category", "attribute", "slots", "participantsCount"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `global-${index}-${Math.random()}`,
      host: { id: `g-${index}`, nickname: item.nickname, friendCode: item.friendCode },
      category: item.category as MushroomCategory,
      attribute: item.attribute as MushroomAttribute,
      slots: item.slots,
      participants: Array(item.participantsCount).fill({ id: 'p', nickname: '...', friendCode: '...' }),
      startTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      createdAt: new Date().toISOString(),
      status: 'active',
      source: 'global'
    }));
  } catch (error) {
    console.error("Failed to fetch global posts:", error);
    return [];
  }
};
