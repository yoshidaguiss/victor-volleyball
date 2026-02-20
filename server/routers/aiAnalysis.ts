import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { generateWithGemini } from "../_core/gemini";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { apiKeys } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { decryptApiKey } from "../apiKeyEncryption";

export const aiAnalysisRouter = router({
  /**
   * 試合状況を分析して戦術提案を生成
   */
  generateTacticalAdvice: protectedProcedure
    .input(z.object({
      matchId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // APIキーを取得
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const apiKeyRecord = await database
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.provider, "gemini")))
        .limit(1);

      if (apiKeyRecord.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Gemini APIキーが設定されていません。設定画面からAPIキーを登録してください。",
        });
      }

      const decryptedApiKey = decryptApiKey(apiKeyRecord[0].encryptedKey);

      // 試合情報を取得
      const match = await db.getMatchById(input.matchId);
      if (!match) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "試合が見つかりません",
        });
      }

      // プレー履歴を取得
      const plays = await db.getPlaysByMatch(input.matchId);

      // チーム情報を取得
      const homeTeam = match.homeTeamId ? await db.getTeamById(match.homeTeamId) : null;
      const awayTeam = match.awayTeamId ? await db.getTeamById(match.awayTeamId) : null;

      // 選手情報を取得
      const homePlayers = match.homeTeamId && match.homeTeamId > 0 ? await db.getPlayersByTeamId(match.homeTeamId) : [];
      const awayPlayers = match.awayTeamId && match.awayTeamId > 0 ? await db.getPlayersByTeamId(match.awayTeamId) : [];

      // 試合状況を分析
      const analysisPrompt = buildAnalysisPrompt(match, plays, homeTeam, awayTeam, homePlayers, awayPlayers);

      try {
        const response = await generateWithGemini(
          decryptedApiKey,
          analysisPrompt,
          "あなたはプロのバレーボールコーチです。試合状況を分析し、具体的で実行可能な戦術提案を行ってください。"
        );

        return {
          advice: response.text,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `AI分析に失敗しました: ${error.message}`,
        });
      }
    }),
});

/**
 * 試合分析プロンプトを構築
 */
function buildAnalysisPrompt(
  match: any,
  plays: any[],
  homeTeam: any,
  awayTeam: any,
  homePlayers: any[],
  awayPlayers: any[]
): string {
  // スコア計算
  const homeScore = match.homeScore || 0;
  const awayScore = match.awayScore || 0;

  // プレー統計を計算
  const stats = {
    home: calculateTeamStats(plays.filter(p => p.teamSide === "home")),
    away: calculateTeamStats(plays.filter(p => p.teamSide === "away")),
  };

  return `
# 試合状況分析

## 基本情報
- ホームチーム: ${homeTeam?.teamName || "ホーム"}
- アウェイチーム: ${awayTeam?.teamName || "アウェイ"}
- 現在のスコア: ${homeScore} - ${awayScore}
- 現在のセット: ${match.currentSet}

## ホームチーム統計
- サーブ成功率: ${stats.home.serveSuccessRate}%
- アタック決定率: ${stats.home.attackSuccessRate}%
- レシーブ成功率: ${stats.home.receiveSuccessRate}%
- ブロック成功率: ${stats.home.blockSuccessRate}%
- ミス数: ${stats.home.errors}

## アウェイチーム統計
- サーブ成功率: ${stats.away.serveSuccessRate}%
- アタック決定率: ${stats.away.attackSuccessRate}%
- レシーブ成功率: ${stats.away.receiveSuccessRate}%
- ブロック成功率: ${stats.away.blockSuccessRate}%
- ミス数: ${stats.away.errors}

## 最近のプレー（直近10プレー）
${plays.slice(-10).map(p => `- ${p.playType} (${p.result}) by Player #${p.playerId}`).join("\n")}

上記の試合状況を分析し、以下の観点から戦術提案を行ってください：

1. **現在の試合展開の分析**
   - どちらのチームが優勢か
   - 各チームの強みと弱み

2. **具体的な戦術提案**
   - サーブの狙い目
   - アタックの戦術
   - 守備の改善点

3. **選手交代の提案**
   - 調子の良い選手
   - 調子の悪い選手
   - 交代を検討すべきタイミング

4. **相手チームの弱点**
   - 攻略すべきポイント
   - 注意すべき選手

回答は日本語で、具体的かつ実行可能な提案を行ってください。
`;
}

/**
 * チーム統計を計算
 */
function calculateTeamStats(plays: any[]) {
  const serves = plays.filter(p => p.playType === "serve");
  const attacks = plays.filter(p => p.playType === "attack");
  const receives = plays.filter(p => p.playType === "receive");
  const blocks = plays.filter(p => p.playType === "block");

  const serveSuccess = serves.filter(p => p.result === "point" || p.result === "continue").length;
  const attackSuccess = attacks.filter(p => p.result === "point").length;
  const receiveSuccess = receives.filter(p => p.result === "continue").length;
  const blockSuccess = blocks.filter(p => p.result === "point").length;

  const errors = plays.filter(p => p.result === "error").length;

  return {
    serveSuccessRate: serves.length > 0 ? Math.round((serveSuccess / serves.length) * 100) : 0,
    attackSuccessRate: attacks.length > 0 ? Math.round((attackSuccess / attacks.length) * 100) : 0,
    receiveSuccessRate: receives.length > 0 ? Math.round((receiveSuccess / receives.length) * 100) : 0,
    blockSuccessRate: blocks.length > 0 ? Math.round((blockSuccess / blocks.length) * 100) : 0,
    errors,
  };
}
