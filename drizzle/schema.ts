import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API Keys table for user-specific API key management
 */
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // "gemini", "openai", etc.
  encryptedKey: text("encryptedKey").notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Teams table
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  teamName: varchar("teamName", { length: 255 }).notNull(),
  season: varchar("season", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Players table
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  number: int("number").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  position: mysqlEnum("position", ["S", "MB", "WS", "OP", "L"]).notNull(),
  isLibero: boolean("isLibero").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Matches table
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  matchCode: varchar("matchCode", { length: 8 }).notNull().unique(),
  date: timestamp("date").notNull(),
  venue: varchar("venue", { length: 255 }),
  homeTeamId: int("homeTeamId").notNull(),
  homeTeamName: varchar("homeTeamName", { length: 255 }).notNull(),
  awayTeamName: varchar("awayTeamName", { length: 255 }).notNull(),
  sets: int("sets").default(5).notNull(),
  isPracticeMatch: boolean("isPracticeMatch").default(false).notNull(),
  status: mysqlEnum("status", ["preparing", "inProgress", "completed"]).default("preparing").notNull(),
  currentSet: int("currentSet").default(1).notNull(),
  scoreHome: json("scoreHome").$type<number[]>(),
  scoreAway: json("scoreAway").$type<number[]>(),
  timeoutsHome: int("timeoutsHome").default(0).notNull(),
  timeoutsAway: int("timeoutsAway").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Rallies table
 */
export const rallies = mysqlTable("rallies", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  setNumber: int("setNumber").notNull(),
  rallyNumber: int("rallyNumber").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  homeScoreBefore: int("homeScoreBefore").default(0).notNull(),
  awayScoreBefore: int("awayScoreBefore").default(0).notNull(),
  homeScoreAfter: int("homeScoreAfter").default(0).notNull(),
  awayScoreAfter: int("awayScoreAfter").default(0).notNull(),
  winner: mysqlEnum("winner", ["home", "away"]),
  duration: int("duration"),
  playCount: int("playCount").default(0).notNull(), // ラリー内のプレー数
  playSequence: json("playSequence").$type<string[]>(), // プレータイプの連鎖 ["serve", "receive", "set", "attack"]
  endPattern: varchar("endPattern", { length: 50 }), // ラリー終了パターン ("attack_kill", "serve_ace", "error", etc.)
});

export type Rally = typeof rallies.$inferSelect;
export type InsertRally = typeof rallies.$inferInsert;

/**
 * Plays table
 */
export const plays = mysqlTable("plays", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  rallyId: int("rallyId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  playType: mysqlEnum("playType", ["serve", "receive", "set", "attack", "block", "dig"]).notNull(),
  teamSide: mysqlEnum("teamSide", ["home", "away"]).notNull(),
  playerId: int("playerId").notNull(),
  playerNumber: int("playerNumber").notNull(),
  playerName: varchar("playerName", { length: 255 }).notNull(),
  positionX: float("positionX").notNull(),
  positionY: float("positionY").notNull(),
  details: json("details").$type<{
    serveType?: "jump" | "float";
    serveResult?: "ace" | "in" | "net" | "out" | "error";
    receiveRating?: "A" | "B" | "C";
    setTarget?: string;
    attackType?: "open" | "quick" | "back" | "pipe" | "slide";
    attackCourse?: "straight" | "cross";
    attackResult?: "kill" | "blocked" | "dug" | "error" | "out";
    blockCount?: 1 | 2 | 3;
    blockResult?: "stuff" | "touch" | "none";
  }>(),
  result: mysqlEnum("result", ["point", "continue", "error"]).notNull(),
});

export type Play = typeof plays.$inferSelect;
export type InsertPlay = typeof plays.$inferInsert;

/**
 * AI Analyses table
 */
export const aiAnalyses = mysqlTable("aiAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  scope: text("scope").notNull(),
  model: varchar("model", { length: 100 }).default("gemini-pro").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  userId: int("userId"),
});

export type AIAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAIAnalysis = typeof aiAnalyses.$inferInsert;

/**
 * Substitutions table - 選手交代記録
 */
export const substitutions = mysqlTable("substitutions", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  setNumber: int("setNumber").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  teamSide: mysqlEnum("teamSide", ["home", "away"]).notNull(),
  playerOutId: int("playerOutId").notNull(),
  playerOutNumber: int("playerOutNumber").notNull(),
  playerOutName: varchar("playerOutName", { length: 255 }).notNull(),
  playerInId: int("playerInId").notNull(),
  playerInNumber: int("playerInNumber").notNull(),
  playerInName: varchar("playerInName", { length: 255 }).notNull(),
  isLibero: boolean("isLibero").default(false).notNull(),
});

export type Substitution = typeof substitutions.$inferSelect;
export type InsertSubstitution = typeof substitutions.$inferInsert;

/**
 * Timeouts table - タイムアウト記録
 */
export const timeouts = mysqlTable("timeouts", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  setNumber: int("setNumber").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  teamSide: mysqlEnum("teamSide", ["home", "away"]).notNull(),
  homeScore: int("homeScore").notNull(),
  awayScore: int("awayScore").notNull(),
  duration: int("duration"),
  type: mysqlEnum("type", ["technical", "regular"]).default("regular").notNull(),
});

export type Timeout = typeof timeouts.$inferSelect;
export type InsertTimeout = typeof timeouts.$inferInsert;

/**
 * Serve Orders table - サーブ順管理
 */
export const serveOrders = mysqlTable("serveOrders", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  setNumber: int("setNumber").notNull(),
  teamSide: mysqlEnum("teamSide", ["home", "away"]).notNull(),
  position: int("position").notNull(), // 1-6
  playerId: int("playerId").notNull(),
  playerNumber: int("playerNumber").notNull(),
  playerName: varchar("playerName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ServeOrder = typeof serveOrders.$inferSelect;
export type InsertServeOrder = typeof serveOrders.$inferInsert;
