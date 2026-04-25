/**
 * PostgreSQL schema setup script.
 * Creates all tables and types idempotently (safe to run multiple times).
 * Used as a replacement for drizzle-kit push in production.
 */
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
console.log("[setup-db] Starting...");
console.log("[setup-db] DATABASE_URL:", DATABASE_URL ? `SET (${DATABASE_URL.substring(0, 30)}...)` : "NOT SET");

if (!DATABASE_URL) {
  console.error("[setup-db] DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

async function setup() {
  console.log("[setup-db] Connecting to database...");
  const client = await pool.connect();
  try {
    console.log("[setup-db] Connected! Starting schema setup...");
    await client.query("BEGIN");

    // --- Enum types ---
    await client.query(`DO $$ BEGIN
      CREATE TYPE "role" AS ENUM('user', 'admin');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE "position" AS ENUM('S', 'MB', 'WS', 'OP', 'L');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE "match_status" AS ENUM('preparing', 'inProgress', 'completed');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE "winner" AS ENUM('home', 'away');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE "play_type" AS ENUM('serve', 'receive', 'set', 'attack', 'block', 'dig');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE "team_side" AS ENUM('home', 'away');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE "result" AS ENUM('point', 'continue', 'error');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    await client.query(`DO $$ BEGIN
      CREATE TYPE "timeout_type" AS ENUM('technical', 'regular');
    EXCEPTION WHEN duplicate_object THEN null; END $$`);

    // --- Tables ---
    await client.query(`CREATE TABLE IF NOT EXISTS "users" (
      "id" serial PRIMARY KEY NOT NULL,
      "openId" varchar(64) NOT NULL UNIQUE,
      "name" text,
      "email" varchar(320),
      "loginMethod" varchar(64),
      "role" "role" NOT NULL DEFAULT 'user',
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "lastSignedIn" timestamp DEFAULT now() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "apiKeys" (
      "id" serial PRIMARY KEY NOT NULL,
      "userId" integer NOT NULL,
      "provider" varchar(50) NOT NULL,
      "encryptedKey" text NOT NULL,
      "usageCount" integer NOT NULL DEFAULT 0,
      "lastUsedAt" timestamp,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "teams" (
      "id" serial PRIMARY KEY NOT NULL,
      "teamName" varchar(255) NOT NULL,
      "season" varchar(50),
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "players" (
      "id" serial PRIMARY KEY NOT NULL,
      "teamId" integer NOT NULL,
      "number" integer NOT NULL,
      "name" varchar(255) NOT NULL,
      "position" "position" NOT NULL,
      "isLibero" boolean NOT NULL DEFAULT false,
      "createdAt" timestamp DEFAULT now() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "matches" (
      "id" serial PRIMARY KEY NOT NULL,
      "matchCode" varchar(8) NOT NULL UNIQUE,
      "date" timestamp NOT NULL,
      "venue" varchar(255),
      "homeTeamId" integer NOT NULL,
      "homeTeamName" varchar(255) NOT NULL,
      "awayTeamName" varchar(255) NOT NULL,
      "sets" integer NOT NULL DEFAULT 5,
      "isPracticeMatch" boolean NOT NULL DEFAULT false,
      "status" "match_status" NOT NULL DEFAULT 'preparing',
      "currentSet" integer NOT NULL DEFAULT 1,
      "scoreHome" json,
      "scoreAway" json,
      "timeoutsHome" integer NOT NULL DEFAULT 0,
      "timeoutsAway" integer NOT NULL DEFAULT 0,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "rallies" (
      "id" serial PRIMARY KEY NOT NULL,
      "matchId" integer NOT NULL,
      "setNumber" integer NOT NULL,
      "rallyNumber" integer NOT NULL,
      "startTime" timestamp NOT NULL,
      "endTime" timestamp,
      "homeScoreBefore" integer NOT NULL DEFAULT 0,
      "awayScoreBefore" integer NOT NULL DEFAULT 0,
      "homeScoreAfter" integer NOT NULL DEFAULT 0,
      "awayScoreAfter" integer NOT NULL DEFAULT 0,
      "winner" "winner",
      "duration" integer,
      "playCount" integer NOT NULL DEFAULT 0,
      "playSequence" json,
      "endPattern" varchar(50)
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "plays" (
      "id" serial PRIMARY KEY NOT NULL,
      "matchId" integer NOT NULL,
      "rallyId" integer NOT NULL,
      "timestamp" timestamp NOT NULL,
      "playType" "play_type" NOT NULL,
      "teamSide" "team_side" NOT NULL,
      "playerId" integer NOT NULL,
      "playerNumber" integer NOT NULL,
      "playerName" varchar(255) NOT NULL,
      "positionX" real NOT NULL,
      "positionY" real NOT NULL,
      "details" json,
      "result" "result" NOT NULL,
      "setNumber" integer NOT NULL DEFAULT 1
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "aiAnalyses" (
      "id" serial PRIMARY KEY NOT NULL,
      "matchId" integer NOT NULL,
      "timestamp" timestamp DEFAULT now() NOT NULL,
      "scope" text NOT NULL,
      "model" varchar(100) NOT NULL DEFAULT 'gemini-pro',
      "prompt" text NOT NULL,
      "response" text NOT NULL,
      "userId" integer
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "substitutions" (
      "id" serial PRIMARY KEY NOT NULL,
      "matchId" integer NOT NULL,
      "setNumber" integer NOT NULL,
      "timestamp" timestamp DEFAULT now() NOT NULL,
      "teamSide" "team_side" NOT NULL,
      "playerOutId" integer NOT NULL,
      "playerOutNumber" integer NOT NULL,
      "playerOutName" varchar(255) NOT NULL,
      "playerInId" integer NOT NULL,
      "playerInNumber" integer NOT NULL,
      "playerInName" varchar(255) NOT NULL,
      "isLibero" boolean NOT NULL DEFAULT false
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "timeouts" (
      "id" serial PRIMARY KEY NOT NULL,
      "matchId" integer NOT NULL,
      "setNumber" integer NOT NULL,
      "timestamp" timestamp DEFAULT now() NOT NULL,
      "teamSide" "team_side" NOT NULL,
      "homeScore" integer NOT NULL,
      "awayScore" integer NOT NULL,
      "duration" integer,
      "type" "timeout_type" NOT NULL DEFAULT 'regular'
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS "serveOrders" (
      "id" serial PRIMARY KEY NOT NULL,
      "matchId" integer NOT NULL,
      "setNumber" integer NOT NULL,
      "teamSide" "team_side" NOT NULL,
      "position" integer NOT NULL,
      "playerId" integer NOT NULL,
      "playerNumber" integer NOT NULL,
      "playerName" varchar(255) NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL
    )`);

    // 後から追加されたカラムのマイグレーション
    await client.query(`ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "awayTeamId" integer`);

    await client.query("COMMIT");
    console.log("[setup-db] Database setup completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[setup-db] Setup failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch((err) => {
  console.error("[setup-db] Fatal error:", err);
  process.exit(1);
});
