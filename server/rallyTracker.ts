import * as db from "./db";

/**
 * ラリー自動追跡システム
 * プレーの連鎖を自動的に記録し、ラリーを管理する
 */

export interface RallyState {
  rallyId: number | null;
  isActive: boolean;
  playSequence: string[];
  startTime: Date | null;
  homeScoreBefore: number;
  awayScoreBefore: number;
}

/**
 * 新しいラリーを開始
 */
export async function startRally(
  matchId: number,
  setNumber: number,
  rallyNumber: number,
  homeScore: number,
  awayScore: number
): Promise<number> {
  const rallyId = await db.createRally({
    matchId,
    setNumber,
    rallyNumber,
    startTime: new Date(),
    homeScoreBefore: homeScore,
    awayScoreBefore: awayScore,
    homeScoreAfter: homeScore,
    awayScoreAfter: awayScore,
    playCount: 0,
    playSequence: [],
  });

  return rallyId;
}

/**
 * ラリーにプレーを追加
 */
export async function addPlayToRally(
  rallyId: number,
  playType: string
): Promise<void> {
  // 現在のラリー情報を取得
  const rallies = await db.getRalliesByMatch(0); // matchIdは不要なのでダミー
  const rally = rallies.find(r => r.id === rallyId);
  
  if (!rally) {
    throw new Error("Rally not found");
  }

  // プレーシーケンスを更新
  const currentSequence = (rally.playSequence as string[]) || [];
  const newSequence = [...currentSequence, playType];

  await db.updateRally(rallyId, {
    playCount: newSequence.length,
    playSequence: newSequence,
  });
}

/**
 * ラリーを終了
 */
export async function endRally(
  rallyId: number,
  winner: "home" | "away",
  homeScoreAfter: number,
  awayScoreAfter: number,
  endPattern: string
): Promise<void> {
  const endTime = new Date();
  
  // 現在のラリー情報を取得して開始時刻を取得
  const rallies = await db.getRalliesByMatch(0);
  const rally = rallies.find(r => r.id === rallyId);
  
  if (!rally) {
    throw new Error("Rally not found");
  }

  const startTime = new Date(rally.startTime);
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  await db.updateRally(rallyId, {
    endTime,
    winner,
    homeScoreAfter,
    awayScoreAfter,
    duration,
    endPattern,
  });
}

/**
 * プレーの結果からラリー終了パターンを判定
 */
export function determineEndPattern(
  playType: string,
  result: string
): string | null {
  if (result === "point") {
    switch (playType) {
      case "serve":
        return "serve_ace";
      case "attack":
        return "attack_kill";
      case "block":
        return "block_stuff";
      default:
        return "point";
    }
  } else if (result === "error") {
    return `${playType}_error`;
  }
  
  return null; // ラリー継続中
}

/**
 * ラリー統計を計算
 */
export interface RallyStats {
  totalRallies: number;
  averagePlayCount: number;
  longestRally: number;
  shortestRally: number;
  endPatterns: Record<string, number>;
  winRate: {
    home: number;
    away: number;
  };
}

export async function calculateRallyStats(matchId: number): Promise<RallyStats> {
  const rallies = await db.getRalliesByMatch(matchId);
  
  if (rallies.length === 0) {
    return {
      totalRallies: 0,
      averagePlayCount: 0,
      longestRally: 0,
      shortestRally: 0,
      endPatterns: {},
      winRate: { home: 0, away: 0 },
    };
  }

  const completedRallies = rallies.filter(r => r.endTime !== null);
  const playCounts = completedRallies.map(r => r.playCount || 0);
  const totalPlayCount = playCounts.reduce((sum, count) => sum + count, 0);
  
  // 終了パターンの集計
  const endPatterns: Record<string, number> = {};
  completedRallies.forEach(rally => {
    const pattern = rally.endPattern || "unknown";
    endPatterns[pattern] = (endPatterns[pattern] || 0) + 1;
  });

  // 勝率の計算
  const homeWins = completedRallies.filter(r => r.winner === "home").length;
  const awayWins = completedRallies.filter(r => r.winner === "away").length;
  const totalWins = homeWins + awayWins;

  return {
    totalRallies: rallies.length,
    averagePlayCount: completedRallies.length > 0 
      ? Math.round((totalPlayCount / completedRallies.length) * 10) / 10 
      : 0,
    longestRally: playCounts.length > 0 ? Math.max(...playCounts) : 0,
    shortestRally: playCounts.length > 0 ? Math.min(...playCounts) : 0,
    endPatterns,
    winRate: {
      home: totalWins > 0 ? Math.round((homeWins / totalWins) * 100) : 0,
      away: totalWins > 0 ? Math.round((awayWins / totalWins) * 100) : 0,
    },
  };
}
