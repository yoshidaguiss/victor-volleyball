import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("matches router", () => {
  it("should create a match with valid input", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.matches.create({
      date: new Date(),
      venue: "Test Venue",
      homeTeamId: 0,
      homeTeamName: "Team A",
      awayTeamName: "Team B",
      sets: 5,
      isPracticeMatch: false,
    });

    expect(result).toHaveProperty("matchId");
    expect(result).toHaveProperty("matchCode");
    expect(result.matchCode).toHaveLength(8);
  });

  it("should retrieve match by ID", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a match first
    const created = await caller.matches.create({
      date: new Date(),
      venue: "Test Venue",
      homeTeamId: 0,
      homeTeamName: "Team A",
      awayTeamName: "Team B",
      sets: 5,
      isPracticeMatch: false,
    });

    // Retrieve it
    const match = await caller.matches.getById({ matchId: created.matchId });

    expect(match).toBeDefined();
    expect(match?.homeTeamName).toBe("Team A");
    expect(match?.awayTeamName).toBe("Team B");
  });
});
