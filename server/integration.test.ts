import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Volleyball Analyzer Integration Tests", () => {
  it("should create a team", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.teams.create({
      teamName: "Test Team",
      coachName: "Coach Test",
    });

    expect(result).toHaveProperty("teamId");
    expect(typeof result.teamId).toBe("number");
  });

  it("should create a match", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const team = await caller.teams.create({
      teamName: "Home Team",
      coachName: "Coach Home",
    });

    const result = await caller.matches.create({
      date: new Date(),
      homeTeamId: team.teamId,
      homeTeamName: "Home Team",
      awayTeamName: "Away Team",
      venue: "Test Venue",
      sets: 5,
      isPracticeMatch: false,
    });

    expect(result).toHaveProperty("matchId");
    expect(result).toHaveProperty("matchCode");
    expect(typeof result.matchId).toBe("number");
    expect(typeof result.matchCode).toBe("string");
    expect(result.matchCode.length).toBeGreaterThan(0);
  });

  it("should retrieve match by code", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const team = await caller.teams.create({
      teamName: "Test Team",
      coachName: "Test Coach",
    });

    const match = await caller.matches.create({
      date: new Date(),
      homeTeamId: team.teamId,
      homeTeamName: "Test Team",
      awayTeamName: "Opponent Team",
      venue: "Test Venue",
    });

    const retrieved = await caller.matches.getByCode({
      matchCode: match.matchCode,
    });

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(match.matchId);
    expect(retrieved?.matchCode).toBe(match.matchCode);
  });

  it("should create a player", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const team = await caller.teams.create({
      teamName: "Player Team",
      coachName: "Player Coach",
    });

    const result = await caller.players.create({
      teamId: team.teamId,
      number: 10,
      name: "Test Player",
      position: "WS",
      isLibero: false,
    });

    expect(result).toHaveProperty("playerId");
    expect(typeof result.playerId).toBe("number");
  });

  it("should list recent matches", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.matches.listRecent({ limit: 5 });

    expect(Array.isArray(result)).toBe(true);
  });
});
