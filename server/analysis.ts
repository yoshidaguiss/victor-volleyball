import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export interface MatchAnalysisInput {
  matchId: number;
  scope: "timeout" | "set_end" | "match_end";
}

export interface MatchAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  opponentPatterns: string[];
  opponentWeaknesses: string[]; // 相手の弱点リスト
  tactics: string[]; // 具体的な戦術リスト
}

/**
 * 試合データからAI戦術分析を生成
 */
export async function generateMatchAnalysis(input: MatchAnalysisInput): Promise<MatchAnalysisResult> {
  const match = await db.getMatchById(input.matchId);
  if (!match) {
    throw new Error("試合が見つかりません");
  }

  const rallies = await db.getRalliesByMatch(input.matchId);
  const allPlays: any[] = [];
  
  for (const rally of rallies || []) {
    const plays = await db.getPlaysByRally(rally.id);
    allPlays.push(...(plays || []));
  }

  // プレーデータの統計を計算
  const homeTeamPlays = allPlays.filter(p => p.teamSide === "home");
  const awayTeamPlays = allPlays.filter(p => p.teamSide === "away");
  
  const homeAttacks = homeTeamPlays.filter(p => p.playType === "attack");
  const homeAttackSuccess = homeAttacks.filter(p => p.result === "point").length;
  const homeAttackRate = homeAttacks.length > 0 
    ? ((homeAttackSuccess / homeAttacks.length) * 100).toFixed(1) 
    : "0.0";

  const awayAttacks = awayTeamPlays.filter(p => p.playType === "attack");
  const awayAttackSuccess = awayAttacks.filter(p => p.result === "point").length;
  const awayAttackRate = awayAttacks.length > 0 
    ? ((awayAttackSuccess / awayAttacks.length) * 100).toFixed(1) 
    : "0.0";

  const homeServes = homeTeamPlays.filter(p => p.playType === "serve");
  const homeServeAces = homeServes.filter(p => p.result === "point").length;
  
  const awayServes = awayTeamPlays.filter(p => p.playType === "serve");
  const awayServeAces = awayServes.filter(p => p.result === "point").length;

  // LLMプロンプトを構築
  const prompt = `あなたは高校バレーボールの経験豊富なコーチです。以下の試合データを分析し、戦術的な示唆を提供してください。

## 試合情報
- 自チーム: ${match.homeTeamName}
- 相手チーム: ${match.awayTeamName}
- 現在のスコア: ${match.scoreHome} - ${match.scoreAway}
- 総ラリー数: ${rallies?.length || 0}

## 統計データ
### ${match.homeTeamName}（自チーム）
- 攻撃成功率: ${homeAttackRate}% (${homeAttackSuccess}/${homeAttacks.length})
- サーブエース: ${homeServeAces}本
- 総プレー数: ${homeTeamPlays.length}

### ${match.awayTeamName}（相手チーム）
- 攻撃成功率: ${awayAttackRate}% (${awayAttackSuccess}/${awayAttacks.length})
- サーブエース: ${awayServeAces}本
- 総プレー数: ${awayTeamPlays.length}

## 分析タイミング
${input.scope === "timeout" ? "タイムアウト中" : input.scope === "set_end" ? "セット終了時" : "試合終了時"}

以下の形式でJSON形式の分析結果を提供してください：

{
  "summary": "現在の試合状況の簡潔な要約（2-3文）",
  "strengths": ["自チームの強み1", "強み2", "強み3"],
  "weaknesses": ["自チームの弱点1", "弱点2", "弱点3"],
  "opponentPatterns": ["相手の攻撃パターン1", "パターン2", "パターン3"],
  "opponentWeaknesses": ["相手の弱点1（具体的なエリアや選手）", "弱点2", "弱点3"],
  "tactics": ["戦術提案1（具体的な攻撃パターンやサーブターゲット）", "戦術提案2", "戦術提案3"],
  "recommendations": ["実践的な改善提案1", "提案2", "提案3"]
}

注意：
- opponentWeaknessesには相手チームの弱点を3つ挙げてください（例：「レフト側のブロックが弱い」「センターのレシーブが不安定」）
- tacticsには具体的な戦術を3つ提案してください（例：「レフト側へのクイック攻撃を増やす」「センター選手を狙ったサーブ」）`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "あなたは高校バレーボールの経験豊富なコーチです。データに基づいた具体的で実践的なアドバイスをJSON形式で提供してください。" },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "match_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string", description: "現在の試合状況の簡潔な要約" },
              strengths: { type: "array", items: { type: "string" }, description: "自チームの強み" },
              weaknesses: { type: "array", items: { type: "string" }, description: "自チームの弱点" },
              opponentPatterns: { type: "array", items: { type: "string" }, description: "相手の攻撃パターン" },
              opponentWeaknesses: { type: "array", items: { type: "string" }, description: "相手チームの弱点" },
              tactics: { type: "array", items: { type: "string" }, description: "具体的な戦術提案" },
              recommendations: { type: "array", items: { type: "string" }, description: "実践的な改善提案" },
            },
            required: ["summary", "strengths", "weaknesses", "opponentPatterns", "opponentWeaknesses", "tactics", "recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    const analysisText = typeof content === "string" ? content : "分析結果を生成できませんでした";

    // JSONパース
    try {
      const result: MatchAnalysisResult = JSON.parse(analysisText);
      return result;
    } catch (parseError) {
      console.error("JSONパースエラー:", parseError);
      // フォールバック結果
      return {
        summary: analysisText,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        opponentPatterns: [],
        opponentWeaknesses: [],
        tactics: [],
      };
    }
  } catch (error) {
    console.error("AI分析エラー:", error);
    throw new Error("AI分析の生成に失敗しました");
  }
}

/**
 * 試合レポートをPDF形式で生成
 */
export async function generateMatchReportPDF(matchId: number): Promise<Buffer> {
  // 簡易実装: 実際にはPDFライブラリを使用
  const match = await db.getMatchById(matchId);
  if (!match) {
    throw new Error("試合が見つかりません");
  }

  const rallies = await db.getRalliesByMatch(matchId);
  
  const reportText = `
試合レポート
================

試合情報
--------
日時: ${new Date(match.date).toLocaleString("ja-JP")}
会場: ${match.venue || "未設定"}
対戦: ${match.homeTeamName} vs ${match.awayTeamName}
スコア: ${match.scoreHome} - ${match.scoreAway}

統計情報
--------
総ラリー数: ${rallies?.length || 0}
セット数: ${match.currentSet}

このレポートはテキスト形式です。
PDF生成機能は今後実装予定です。
  `;

  return Buffer.from(reportText, "utf-8");
}
