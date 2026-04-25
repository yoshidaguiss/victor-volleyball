/**
 * コンテキスト予測エンジン
 * 前のプレーから次のプレーを予測し、最小限のタップで最大限のデータ入力を実現
 */

import { getPredictionWithLearning } from "./learningEngine";

export type PlayType = "serve" | "receive" | "set" | "attack" | "block" | "dig";
export type PlayResult = "point" | "error" | "continue";

export interface Play {
  playType: PlayType;
  playerId: number;
  playerNumber: number;
  teamSide: "home" | "away";
  result: PlayResult;
  positionX: number;
  positionY: number;
}

export interface Player {
  id: number;
  number: number;
  name: string;
  position: "S" | "MB" | "WS" | "OP" | "L";
}

export interface PredictionResult {
  playType: PlayType;
  playerId: number | null;
  playerNumber: number | null;
  positionX: number;
  positionY: number;
  confidence: number; // 0-1の予測信頼度
}

/**
 * プレーシーケンスのパターン
 */
const PLAY_SEQUENCE_PATTERNS: Record<PlayType, PlayType[]> = {
  serve: ["receive", "dig"], // サーブの次はレシーブまたはディグ
  receive: ["set", "attack"], // レシーブの次はセットまたはアタック（直接）
  set: ["attack", "block"], // セットの次はアタックまたはブロック
  attack: ["block", "dig", "receive"], // アタックの次はブロック、ディグ、またはレシーブ
  block: ["dig", "set"], // ブロックの次はディグまたはセット
  dig: ["set", "attack"], // ディグの次はセットまたはアタック
};

/**
 * ポジション別のデフォルトコート位置
 */
const POSITION_DEFAULT_LOCATIONS: Record<string, { x: number; y: number }> = {
  S: { x: 0.5, y: 0.3 }, // セッター：前衛中央
  MB: { x: 0.5, y: 0.5 }, // ミドルブロッカー：中央
  WS: { x: 0.2, y: 0.5 }, // ウイングスパイカー：左サイド
  OP: { x: 0.8, y: 0.5 }, // オポジット：右サイド
  L: { x: 0.5, y: 0.8 }, // リベロ：後衛中央
};

/**
 * プレータイプ別のデフォルトコート位置
 */
const PLAY_TYPE_DEFAULT_LOCATIONS: Record<PlayType, { x: number; y: number }> = {
  serve: { x: 0.5, y: 0.95 }, // サーブ：後衛中央
  receive: { x: 0.5, y: 0.7 }, // レシーブ：後衛
  set: { x: 0.7, y: 0.3 }, // セット：前衛右
  attack: { x: 0.3, y: 0.2 }, // アタック：前衛左
  block: { x: 0.5, y: 0.1 }, // ブロック：ネット際
  dig: { x: 0.5, y: 0.6 }, // ディグ：後衛
};

/**
 * 次のプレータイプを予測
 */
export function predictNextPlayType(recentPlays: Play[]): PlayType | null {
  if (recentPlays.length === 0) {
    return "serve"; // 最初のプレーはサーブ
  }

  const lastPlay = recentPlays[recentPlays.length - 1];

  // ラリーが終了している場合は次のサーブ
  if (lastPlay.result === "point" || lastPlay.result === "error") {
    return "serve";
  }

  // プレーシーケンスパターンから予測
  const possibleNextPlays = PLAY_SEQUENCE_PATTERNS[lastPlay.playType];
  if (possibleNextPlays && possibleNextPlays.length > 0) {
    // 最も可能性の高いプレータイプを返す（最初の要素）
    return possibleNextPlays[0];
  }

  return null;
}

/**
 * 次のプレーヤーを予測
 */
export function predictNextPlayer(
  predictedPlayType: PlayType,
  currentPlayers: Player[],
  recentPlays: Play[],
  currentTeamSide: "home" | "away"
): { playerId: number; playerNumber: number } | null {
  if (currentPlayers.length === 0) {
    return null;
  }

  // プレータイプに適したポジションの選手を優先
  const preferredPositions: Record<PlayType, string[]> = {
    serve: ["S", "MB", "WS", "OP", "L"], // 全ポジション
    receive: ["L", "WS", "OP"], // リベロ、ウイングスパイカー
    set: ["S"], // セッター
    attack: ["WS", "OP", "MB"], // アタッカー
    block: ["MB", "WS", "OP"], // ブロッカー
    dig: ["L", "WS", "OP"], // レシーバー
  };

  const positions = preferredPositions[predictedPlayType] || [];
  
  // 優先ポジションの選手を探す
  for (const position of positions) {
    const player = currentPlayers.find(p => p.position === position);
    if (player) {
      return { playerId: player.id, playerNumber: player.number };
    }
  }

  // 優先ポジションが見つからない場合は最初の選手
  const firstPlayer = currentPlayers[0];
  return { playerId: firstPlayer.id, playerNumber: firstPlayer.number };
}

/**
 * 次のプレー位置を予測
 */
export function predictNextPosition(
  predictedPlayType: PlayType,
  predictedPlayer: Player | null
): { x: number; y: number } {
  // プレーヤーのポジションに基づいて位置を予測
  if (predictedPlayer && predictedPlayer.position in POSITION_DEFAULT_LOCATIONS) {
    const playerPosition = POSITION_DEFAULT_LOCATIONS[predictedPlayer.position];
    const playTypePosition = PLAY_TYPE_DEFAULT_LOCATIONS[predictedPlayType];
    
    // プレーヤーのポジションとプレータイプの位置を加重平均
    return {
      x: playerPosition.x * 0.6 + playTypePosition.x * 0.4,
      y: playerPosition.y * 0.6 + playTypePosition.y * 0.4,
    };
  }

  // プレータイプのデフォルト位置を返す
  return PLAY_TYPE_DEFAULT_LOCATIONS[predictedPlayType];
}

/**
 * 次のプレーを総合的に予測
 */
export function predictNextPlay(
  recentPlays: Play[],
  currentPlayers: Player[],
  currentTeamSide: "home" | "away"
): PredictionResult | null {
  // プレータイプを予測
  const predictedPlayType = predictNextPlayType(recentPlays);
  if (!predictedPlayType) {
    return null;
  }

  // プレーヤーを予測
  const predictedPlayerInfo = predictNextPlayer(
    predictedPlayType,
    currentPlayers,
    recentPlays,
    currentTeamSide
  );

  // 予測されたプレーヤーの詳細情報を取得
  const predictedPlayer = predictedPlayerInfo
    ? currentPlayers.find(p => p.id === predictedPlayerInfo.playerId)
    : null;

  // 位置を予測
  const predictedPosition = predictNextPosition(predictedPlayType, predictedPlayer || null);
  const defaultPosition = predictedPosition;

  // 基本的な信頼度を計算
  let baseConfidence = 0.7; // デフォルト信頼度
  if (recentPlays.length > 5) {
    baseConfidence = 0.85; // データが多いほど信頼度が高い
  }

  // 学習データを使用して信頼度を向上
  const confidence = getPredictionWithLearning(
    baseConfidence,
    predictedPlayType,
    predictedPlayer?.id,
    recentPlays,
    currentTeamSide
  );

  return {
    playType: predictedPlayType,
    playerId: predictedPlayer?.id || null,
    playerNumber: predictedPlayer?.number || null,
    positionX: defaultPosition.x,
    positionY: defaultPosition.y,
    confidence,
  };
}

/**
 * スコアボードの変化から結果を自動判定
 */
export function autoDetectResult(
  previousHomeScore: number,
  previousAwayScore: number,
  currentHomeScore: number,
  currentAwayScore: number,
  currentTeamSide: "home" | "away"
): PlayResult {
  const homeScoreChanged = currentHomeScore > previousHomeScore;
  const awayScoreChanged = currentAwayScore > previousAwayScore;

  if (homeScoreChanged || awayScoreChanged) {
    return "point";
  }

  return "continue";
}
