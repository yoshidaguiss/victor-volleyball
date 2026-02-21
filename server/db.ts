import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users, teams, players, matches, rallies, plays, aiAnalyses, substitutions, timeouts, serveOrders } from "../drizzle/schema";
import type { User, InsertUser, Team, InsertTeam, Player, InsertPlayer, Match, InsertMatch, Rally, InsertRally, Play, InsertPlay, AIAnalysis, InsertAIAnalysis, Substitution, InsertSubstitution, Timeout, InsertTimeout, ServeOrder, InsertServeOrder } from "../drizzle/schema";
import { ENV } from './_core/env';


let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing.length > 0) {
      const updateSet: Record<string, unknown> = {};
      if (user.name !== undefined) updateSet.name = user.name ?? null;
      if (user.email !== undefined) updateSet.email = user.email ?? null;
      if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod ?? null;
      if (user.lastSignedIn !== undefined) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) updateSet.role = user.role;
      
      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }
      updateSet.updatedAt = new Date();
      
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      const values: InsertUser = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
      };
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Team operations
export async function createTeam(teamData: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(teams).values(teamData).returning({ id: teams.id });
  return result[0].id;
}

export async function getTeamsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Return all teams since we removed authentication
  return await db.select().from(teams).orderBy(desc(teams.createdAt));
}

export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  return result.length > 0 ? result[0] : null;
}



// Player operations
export async function createPlayer(playerData: InsertPlayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(players).values(playerData).returning({ id: players.id });
  return result[0].id;
}

export async function getPlayersByTeamId(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(players).where(eq(players.teamId, teamId));
}

export async function getPlayerById(playerId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(players).where(eq(players.id, playerId));
  return result[0] || null;
}

export async function updatePlayer(playerId: number, updates: Partial<InsertPlayer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(players).set(updates).where(eq(players.id, playerId));
}

export async function deletePlayer(playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(players).where(eq(players.id, playerId));
}

// Match operations
export async function createMatch(matchData: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(matches).values(matchData).returning({ id: matches.id });
  return result[0].id;
}

export async function getMatchByCode(matchCode: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(matches).where(eq(matches.matchCode, matchCode.toUpperCase())).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getMatchById(matchId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateMatch(matchId: number, updates: Partial<Match>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(matches).set(updates).where(eq(matches.id, matchId));
}

export async function getMatchesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Return all matches since we removed authentication
  return await db.select().from(matches).orderBy(desc(matches.date));
}

// Rally operations
export async function createRally(rallyData: InsertRally) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rallies).values(rallyData).returning({ id: rallies.id });
  return result[0].id;
}

export async function getRalliesByMatch(matchId: number, setNumber?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = setNumber 
    ? and(eq(rallies.matchId, matchId), eq(rallies.setNumber, setNumber))
    : eq(rallies.matchId, matchId);
  
  return await db.select().from(rallies).where(conditions);
}

export async function updateRally(rallyId: number, updates: Partial<Rally>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(rallies).set(updates).where(eq(rallies.id, rallyId));
}

// Play operations
export async function createPlay(playData: InsertPlay) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(plays).values(playData).returning({ id: plays.id });
  return result[0].id;
}

export async function getPlaysByRally(rallyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(plays).where(eq(plays.rallyId, rallyId));
}

export async function getPlaysByMatch(matchId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(plays).where(eq(plays.matchId, matchId)).orderBy(plays.timestamp);
}

export async function getPlaysByPlayer(playerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(plays).where(eq(plays.playerId, playerId)).orderBy(plays.timestamp);
}

// AI Analysis operations
export async function createAIAnalysis(analysisData: InsertAIAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiAnalyses).values(analysisData).returning({ id: aiAnalyses.id });
  return result[0].id;
}

export async function getAIAnalysesByMatch(matchId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(aiAnalyses).where(eq(aiAnalyses.matchId, matchId)).orderBy(desc(aiAnalyses.timestamp));
}

export async function getRecentMatches(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(matches).orderBy(desc(matches.date)).limit(limit);
}

// Substitution operations
export async function createSubstitution(substitutionData: InsertSubstitution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(substitutions).values(substitutionData).returning({ id: substitutions.id });
  return result[0].id;
}

export async function getSubstitutionsByMatch(matchId: number, setNumber?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (setNumber !== undefined) {
    return await db.select().from(substitutions)
      .where(and(eq(substitutions.matchId, matchId), eq(substitutions.setNumber, setNumber)))
      .orderBy(desc(substitutions.timestamp));
  }
  
  return await db.select().from(substitutions)
    .where(eq(substitutions.matchId, matchId))
    .orderBy(desc(substitutions.timestamp));
}

// Timeout operations
export async function createTimeout(timeoutData: InsertTimeout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(timeouts).values(timeoutData).returning({ id: timeouts.id });
  return result[0].id;
}

export async function getTimeoutsByMatch(matchId: number, setNumber?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (setNumber !== undefined) {
    return await db.select().from(timeouts)
      .where(and(eq(timeouts.matchId, matchId), eq(timeouts.setNumber, setNumber)))
      .orderBy(desc(timeouts.timestamp));
  }
  
  return await db.select().from(timeouts)
    .where(eq(timeouts.matchId, matchId))
    .orderBy(desc(timeouts.timestamp));
}

// Serve Order operations
export async function createServeOrder(serveOrderData: InsertServeOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(serveOrders).values(serveOrderData).returning({ id: serveOrders.id });
  return result[0].id;
}

export async function getServeOrdersByMatch(matchId: number, setNumber: number, teamSide: "home" | "away") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(serveOrders)
    .where(and(
      eq(serveOrders.matchId, matchId),
      eq(serveOrders.setNumber, setNumber),
      eq(serveOrders.teamSide, teamSide)
    ))
    .orderBy(serveOrders.position);
}

export async function updateServeOrder(matchId: number, setNumber: number, teamSide: "home" | "away", orders: Array<{ position: number; playerId: number; playerNumber: number; playerName: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 既存のサーブ順を削除
  await db.delete(serveOrders)
    .where(and(
      eq(serveOrders.matchId, matchId),
      eq(serveOrders.setNumber, setNumber),
      eq(serveOrders.teamSide, teamSide)
    ));
  
  // 新しいサーブ順を挿入
  for (const order of orders) {
    await db.insert(serveOrders).values({
      matchId,
      setNumber,
      teamSide,
      position: order.position,
      playerId: order.playerId,
      playerNumber: order.playerNumber,
      playerName: order.playerName,
    });
  }
}

// Play deletion
export async function deletePlay(playId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(plays).where(eq(plays.id, playId));
}
