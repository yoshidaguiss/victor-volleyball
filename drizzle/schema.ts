import { integer, pgEnum, pgTable, text, timestamp, varchar, json, boolean, real, serial } from "drizzle-orm/pg-core";

/**
 * Enums for PostgreSQL
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const positionEnum = pgEnum("position", ["S", "MB", "WS", "OP", "L"]);
export const matchStatusEnum = pgEnum("match_status", ["preparing", "inProgress", "completed"]);
export const winnerEnum = pgEnum("winner", ["home", "away"]);
export const playTypeEnum = pgEnum("play_type", ["serve", "receive", "set", "attack", "block", "dig"]);
export const teamSideEnum = pgEnum("team_side", ["home", "away"]);
export const resultEnum = pgEnum("result", ["point", "continue", "error"]);
export const timeoutTypeEnum = pgEnum("timeout_type", ["technical", "regular"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API Keys table for user-specific API key management
 */
export const apiKeys = pgTable("apiKeys", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  encryptedKey: text("encryptedKey").notNull(),
  usageCount: integer("usageCount").default(0).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Teams table
 */
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  teamName: varchar("teamName", { length: 255 }).notNull(),
  season: varchar("season", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Players table
 */
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("teamId").notNull(),
  number: integer("number").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  position: positionEnum("position").notNull(),
  isLibero: boolean("isLibero").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Matches table
 */
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchCode: varchar("matchCode", { length: 8 }).notNull().unique(),
  date: timestamp("date").notNull(),
  venue: varchar("venue", { length: 255 }),
  homeTeamId: integer("homeTeamId").notNull(),
  homeTeamName: varchar("homeTeamName", { length: 255 }).notNull(),
  awayTeamName: varchar("awayTeamName", { length: 255 }).notNull(),
  sets: integer("sets").default(5).notNull(),
  isPracticeMatch: boolean("isPracticeMatch").default(false).notNull(),
  status: matchStatusEnum("status").default("preparing").notNull(),
  currentSet: integer("currentSet").default(1).notNull(),
  scoreHome: json("scoreHome").$type<number[]>(),
  scoreAway: json("scoreAway").$type<number[]>(),
  timeoutsHome: integer("timeoutsHome").default(0).notNull(),
  timeoutsAway: integer("timeoutsAway").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Rallies table
 */
export const rallies = pgTable("rallies", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId").notNull(),
  setNumber: integer("setNumber").notNull(),
  rallyNumber: integer("rallyNumber").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  homeScoreBefore: integer("homeScoreBefore").default(0).notNull(),
  awayScoreBefore: integer("awayScoreBefore").default(0).notNull(),
  homeScoreAfter: integer("homeScoreAfter").default(0).notNull(),
  awayScoreAfter: integer("awayScoreAfter").default(0).notNull(),
  winner: winnerEnum("winner"),
  duration: integer("duration"),
  playCount: integer("playCount").default(0).notNull(),
  playSequence: json("playSequence").$type<string[]>(),
  endPattern: varchar("endPattern", { length: 50 }),
});

export type Rally = typeof rallies.$inferSelect;
export type InsertRally = typeof rallies.$inferInsert;

/**
 * Plays table
 */
export const plays = pgTable("plays", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId").notNull(),
  rallyId: integer("rallyId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  playType: playTypeEnum("playType").notNull(),
  teamSide: teamSideEnum("teamSide").notNull(),
  playerId: integer("playerId").notNull(),
  playerNumber: integer("playerNumber").notNull(),
  playerName: varchar("playerName", { length: 255 }).notNull(),
  positionX: real("positionX").notNull(),
  positionY: real("positionY").notNull(),
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
  result: resultEnum("result").notNull(),
});

export type Play = typeof plays.$inferSelect;
export type InsertPlay = typeof plays.$inferInsert;

/**
 * AI Analyses table
 */
export const aiAnalyses = pgTable("aiAnalyses", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  scope: text("scope").notNull(),
  model: varchar("model", { length: 100 }).default("gemini-pro").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  userId: integer("userId"),
});

export type AIAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAIAnalysis = typeof aiAnalyses.$inferInsert;

/**
 * Substitutions table - 選手交代記録
 */
export const substitutions = pgTable("substitutions", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId").notNull(),
  setNumber: integer("setNumber").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  teamSide: teamSideEnum("teamSide").notNull(),
  playerOutId: integer("playerOutId").notNull(),
  playerOutNumber: integer("playerOutNumber").notNull(),
  playerOutName: varchar("playerOutName", { length: 255 }).notNull(),
  playerInId: integer("playerInId").notNull(),
  playerInNumber: integer("playerInNumber").notNull(),
  playerInName: varchar("playerInName", { length: 255 }).notNull(),
  isLibero: boolean("isLibero").default(false).notNull(),
});

export type Substitution = typeof substitutions.$inferSelect;
export type InsertSubstitution = typeof substitutions.$inferInsert;

/**
 * Timeouts table - タイムアウト記録
 */
export const timeouts = pgTable("timeouts", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId").notNull(),
  setNumber: integer("setNumber").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  teamSide: teamSideEnum("teamSide").notNull(),
  homeScore: integer("homeScore").notNull(),
  awayScore: integer("awayScore").notNull(),
  duration: integer("duration"),
  type: timeoutTypeEnum("type").default("regular").notNull(),
});

export type Timeout = typeof timeouts.$inferSelect;
export type InsertTimeout = typeof timeouts.$inferInsert;

/**
 * Serve Orders table - サーブ順管理
 */
export const serveOrders = pgTable("serveOrders", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId").notNull(),
  setNumber: integer("setNumber").notNull(),
  teamSide: teamSideEnum("teamSide").notNull(),
  position: integer("position").notNull(),
  playerId: integer("playerId").notNull(),
  playerNumber: integer("playerNumber").notNull(),
  playerName: varchar("playerName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ServeOrder = typeof serveOrders.$inferSelect;
export type InsertServeOrder = typeof serveOrders.$inferInsert;
