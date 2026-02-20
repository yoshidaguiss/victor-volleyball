/**
 * Gemini API Helper
 * 
 * Google Gemini APIを使用してAI分析を実行するヘルパー関数
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  text: string;
  finishReason?: string;
}

/**
 * Gemini APIを使用してテキスト生成を実行
 * @param apiKey - Gemini APIキー
 * @param prompt - プロンプト
 * @param systemInstruction - システム指示（オプション）
 * @returns 生成されたテキスト
 */
export async function generateWithGemini(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<GeminiResponse> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return {
      text,
      finishReason: response.candidates?.[0]?.finishReason,
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(`Gemini API error: ${error.message || "Unknown error"}`);
  }
}

/**
 * Gemini APIを使用してチャット形式で対話
 * @param apiKey - Gemini APIキー
 * @param messages - メッセージ履歴
 * @param systemInstruction - システム指示（オプション）
 * @returns 生成されたテキスト
 */
export async function chatWithGemini(
  apiKey: string,
  messages: GeminiMessage[],
  systemInstruction?: string
): Promise<GeminiResponse> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat({
      history: messages.slice(0, -1),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    const text = response.text();

    return {
      text,
      finishReason: response.candidates?.[0]?.finishReason,
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(`Gemini API error: ${error.message || "Unknown error"}`);
  }
}

/**
 * Gemini API接続をテスト
 * @param apiKey - Gemini APIキー
 * @returns 接続が成功したかどうか
 */
export async function testGeminiConnection(apiKey: string): Promise<boolean> {
  try {
    const result = await generateWithGemini(
      apiKey,
      "Hello, please respond with 'OK' if you can read this message.",
      "You are a test assistant. Respond concisely."
    );
    return result.text.length > 0;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}
