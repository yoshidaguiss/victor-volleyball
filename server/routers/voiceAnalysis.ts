import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/**
 * 音声実況からプレーデータを抽出するためのtRPCルーター
 */

const extractedPlaySchema = z.object({
  playerNumber: z.number(),
  playType: z.enum(["serve", "receive", "set", "attack", "block", "dig"]),
  result: z.enum(["point", "error", "continue"]),
  confidence: z.number().min(0).max(1),
});

export const voiceAnalysisRouter = router({
  /**
   * 音声実況テキストからプレーデータを抽出
   */
  extractPlays: publicProcedure
    .input(
      z.object({
        transcript: z.string(),
        homeTeamName: z.string(),
        awayTeamName: z.string(),
      })
    )
    .output(
      z.object({
        plays: z.array(extractedPlaySchema),
        rawResponse: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { transcript, homeTeamName, awayTeamName } = input;

      // Gemini APIを使用して文脈理解と構造化データ抽出
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `あなたはバレーボールの試合実況を分析するAIアシスタントです。
ユーザーが話した実況テキストから、プレーデータを抽出してJSON形式で返してください。

抽出する情報：
- playerNumber: 背番号（数字）
- playType: プレータイプ（"serve", "receive", "set", "attack", "block", "dig"のいずれか）
- result: 結果（"point"=得点, "error"=エラー, "continue"=継続）
- confidence: 信頼度（0-1の数値、確信度が高いほど1に近い）

例：
入力: "背番号5がアタック、決まった！次は相手のサーブ、背番号3がレシーブ"
出力: [
  {"playerNumber": 5, "playType": "attack", "result": "point", "confidence": 0.95},
  {"playerNumber": 3, "playType": "receive", "result": "continue", "confidence": 0.85}
]

注意事項：
- 「決まった」「得点」→ result: "point"
- 「ミス」「エラー」「アウト」→ result: "error"
- それ以外 → result: "continue"
- 背番号が明示されていない場合は抽出しない
- 複数のプレーが含まれている場合は全て抽出する

試合情報：
- ホームチーム: ${homeTeamName}
- アウェイチーム: ${awayTeamName}`,
          },
          {
            role: "user",
            content: transcript,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "extracted_plays",
            strict: true,
            schema: {
              type: "object",
              properties: {
                plays: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      playerNumber: { type: "number" },
                      playType: {
                        type: "string",
                        enum: ["serve", "receive", "set", "attack", "block", "dig"],
                      },
                      result: {
                        type: "string",
                        enum: ["point", "error", "continue"],
                      },
                      confidence: { type: "number" },
                    },
                    required: ["playerNumber", "playType", "result", "confidence"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["plays"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawResponse = typeof response.choices[0].message.content === "string" 
        ? response.choices[0].message.content 
        : JSON.stringify(response.choices[0].message.content) || "{}";
      const parsedResponse = JSON.parse(rawResponse);

      return {
        plays: parsedResponse.plays || [],
        rawResponse,
      };
    }),
});
