import { getDb } from "./db";
import { plays, rallies } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export interface PlayerStatistics {
  playerId: number;
  playerName: string;
  playerNumber: number;
  totalPlays: number;
  serves: { total: number; points: number; errors: number; rate: number };
  receives: { total: number; perfect: number; errors: number; rate: number };
  attacks: { total: number; points: number; errors: number; rate: number };
  blocks: { total: number; points: number; errors: number; rate: number };
}

export interface TeamStatistics {
  totalPlays: number;
  playTypeDistribution: { type: string; count: number }[];
  successRate: number;
  errorRate: number;
}

export interface MatchStatistics {
  home: TeamStatistics;
  away: TeamStatistics;
  players: PlayerStatistics[];
}

export async function calculateMatchStatistics(matchId: number): Promise<MatchStatistics> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 全プレーデータを取得
  const allPlays = await db
    .select()
    .from(plays)
    .where(eq(plays.matchId, matchId));

  // チーム別統計
  const homePlays = allPlays.filter(p => p.teamSide === "home");
  const awayPlays = allPlays.filter(p => p.teamSide === "away");

  const calculateTeamStats = (teamPlays: typeof allPlays): TeamStatistics => {
    const totalPlays = teamPlays.length;
    const successCount = teamPlays.filter(p => p.result === "point").length;
    const errorCount = teamPlays.filter(p => p.result === "error").length;

    const playTypeDistribution = [
      { type: "serve", count: teamPlays.filter(p => p.playType === "serve").length },
      { type: "receive", count: teamPlays.filter(p => p.playType === "receive").length },
      { type: "attack", count: teamPlays.filter(p => p.playType === "attack").length },
      { type: "block", count: teamPlays.filter(p => p.playType === "block").length },
    ];

    return {
      totalPlays,
      playTypeDistribution,
      successRate: totalPlays > 0 ? (successCount / totalPlays) * 100 : 0,
      errorRate: totalPlays > 0 ? (errorCount / totalPlays) * 100 : 0,
    };
  };

  // 選手別統計
  const playerStatsMap = new Map<number, PlayerStatistics>();

  for (const play of allPlays) {
    if (!play.playerId) continue;

    if (!playerStatsMap.has(play.playerId)) {
      playerStatsMap.set(play.playerId, {
        playerId: play.playerId,
        playerName: play.playerName || "",
        playerNumber: play.playerNumber || 0,
        totalPlays: 0,
        serves: { total: 0, points: 0, errors: 0, rate: 0 },
        receives: { total: 0, perfect: 0, errors: 0, rate: 0 },
        attacks: { total: 0, points: 0, errors: 0, rate: 0 },
        blocks: { total: 0, points: 0, errors: 0, rate: 0 },
      });
    }

    const stats = playerStatsMap.get(play.playerId)!;
    stats.totalPlays++;

    switch (play.playType) {
      case "serve":
        stats.serves.total++;
        if (play.result === "point") stats.serves.points++;
        if (play.result === "error") stats.serves.errors++;
        break;
      case "receive":
        stats.receives.total++;
        if (play.result === "point") stats.receives.perfect++;
        if (play.result === "error") stats.receives.errors++;
        break;
      case "attack":
        stats.attacks.total++;
        if (play.result === "point") stats.attacks.points++;
        if (play.result === "error") stats.attacks.errors++;
        break;
      case "block":
        stats.blocks.total++;
        if (play.result === "point") stats.blocks.points++;
        if (play.result === "error") stats.blocks.errors++;
        break;
    }
  }

  // 成功率を計算
  const playerStatsArray = Array.from(playerStatsMap.values());
  for (const stats of playerStatsArray) {
    if (stats.serves.total > 0) {
      stats.serves.rate = (stats.serves.points / stats.serves.total) * 100;
    }
    if (stats.receives.total > 0) {
      stats.receives.rate = (stats.receives.perfect / stats.receives.total) * 100;
    }
    if (stats.attacks.total > 0) {
      stats.attacks.rate = (stats.attacks.points / stats.attacks.total) * 100;
    }
    if (stats.blocks.total > 0) {
      stats.blocks.rate = (stats.blocks.points / stats.blocks.total) * 100;
    }
  }

  return {
    home: calculateTeamStats(homePlays),
    away: calculateTeamStats(awayPlays),
    players: playerStatsArray,
  };
}

export interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
  result: "point" | "continue" | "error";
}

export async function getHeatmapData(
  matchId: number,
  playType: "serve" | "receive" | "attack" | "block"
): Promise<HeatmapPoint[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allPlays = await db
    .select()
    .from(plays)
    .where(and(eq(plays.matchId, matchId), eq(plays.playType, playType)));

  return allPlays
    .filter(p => p.positionX !== null && p.positionY !== null)
    .map(p => ({
      x: p.positionX!,
      y: p.positionY!,
      value: 1,
      result: p.result as "point" | "continue" | "error",
    }));
}
