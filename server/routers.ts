import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { apiKeysRouter } from "./routers/apiKeys";
import { voiceAnalysisRouter } from "./routers/voiceAnalysis";
import { aiAnalysisRouter } from "./routers/aiAnalysis";

// 試合コード生成ヘルパー
function generateMatchCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const appRouter = router({
  system: systemRouter,
  apiKeys: apiKeysRouter,
  voiceAnalysis: voiceAnalysisRouter,
  aiAnalysis: aiAnalysisRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // チーム管理
  teams: router({
    create: protectedProcedure
      .input(z.object({
        teamName: z.string(),
        season: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamId = await db.createTeam({
          teamName: input.teamName,
          season: input.season,
          userId: ctx.user.id,
        });
        return { teamId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTeamsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTeamById(input.teamId);
      }),
  }),

  // 選手管理
  players: router({
    create: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        number: z.number(),
        name: z.string(),
        position: z.enum(["S", "MB", "WS", "OP", "L"]),
        isLibero: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const playerId = await db.createPlayer(input);
        return { playerId };
      }),

    listByTeam: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayersByTeamId(input.teamId);
      }),

    getById: publicProcedure
      .input(z.object({ playerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayerById(input.playerId);
      }),

    update: protectedProcedure
      .input(z.object({
        playerId: z.number(),
        number: z.number().optional(),
        name: z.string().optional(),
        position: z.enum(["S", "MB", "WS", "OP", "L"]).optional(),
        isLibero: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updatePlayer(input.playerId, input);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ playerId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePlayer(input.playerId);
        return { success: true };
      }),
  }),

  // 試合管理
  matches: router({
    create: protectedProcedure
      .input(z.object({
        date: z.date(),
        venue: z.string().optional(),
        homeTeamId: z.number(),
        homeTeamName: z.string(),
        awayTeamName: z.string(),
        sets: z.number().default(5),
        isPracticeMatch: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const matchCode = generateMatchCode();
        const matchId = await db.createMatch({
          ...input,
          matchCode,
          status: "preparing",
          currentSet: 1,
          scoreHome: [],
          scoreAway: [],
          timeoutsHome: 0,
          timeoutsAway: 0,
          userId: ctx.user.id,
        });
        return { matchId, matchCode };
      }),

    getByCode: publicProcedure
      .input(z.object({ matchCode: z.string() }))
      .query(async ({ input }) => {
        return await db.getMatchByCode(input.matchCode);
      }),

    getById: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatchById(input.matchId);
      }),

    listRecent: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.getRecentMatches(input.limit);
      }),

    update: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        status: z.enum(["preparing", "inProgress", "completed"]).optional(),
        currentSet: z.number().optional(),
        scoreHome: z.array(z.number()).optional(),
        scoreAway: z.array(z.number()).optional(),
        timeoutsHome: z.number().optional(),
        timeoutsAway: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { matchId, ...updates } = input;
        await db.updateMatch(matchId, updates);
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMatchesByUserId(ctx.user.id);
    }),
  }),

  // ラリー管理
  rallies: router({
    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        setNumber: z.number(),
        rallyNumber: z.number(),
        homeScoreBefore: z.number(),
        awayScoreBefore: z.number(),
      }))
      .mutation(async ({ input }) => {
        const rallyId = await db.createRally({
          ...input,
          startTime: new Date(),
          homeScoreAfter: input.homeScoreBefore,
          awayScoreAfter: input.awayScoreBefore,
        });
        return { rallyId };
      }),

    update: protectedProcedure
      .input(z.object({
        rallyId: z.number(),
        endTime: z.date().optional(),
        homeScoreAfter: z.number().optional(),
        awayScoreAfter: z.number().optional(),
        winner: z.enum(["home", "away"]).optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { rallyId, ...updates } = input;
        await db.updateRally(rallyId, updates);
        return { success: true };
      }),

    listByMatch: publicProcedure
      .input(z.object({
        matchId: z.number(),
        setNumber: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getRalliesByMatch(input.matchId, input.setNumber);
      }),

    stats: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        const { calculateRallyStats } = await import("./rallyTracker");
        return await calculateRallyStats(input.matchId);
      }),
  }),

  plays: router({
    create: protectedProcedure
      .input(z.object({
        setNumber: z.number(),
        rallyNumber: z.number(),
        matchId: z.number(),
        playerId: z.number(),
        playType: z.enum(["serve", "receive", "set", "attack", "block", "dig"]),
        result: z.enum(["point", "continue", "error"]),
        teamSide: z.enum(["home", "away"]).default("home"),
        positionX: z.number(),
        positionY: z.number(),
        details: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const playId = await db.createPlay({
          matchId: input.matchId,
          rallyId: 0,
          playType: input.playType,
          teamSide: input.teamSide,
          playerId: input.playerId,
          playerNumber: 0,
          playerName: "",
          positionX: input.positionX,
          positionY: input.positionY,
          result: input.result,
          details: input.details ? JSON.parse(input.details) : null,
          timestamp: new Date(),
        });

        // スコア更新：resultが"point"の場合、得点したチームのスコアを+1
        if (input.result === "point") {
          const match = await db.getMatchById(input.matchId);
          if (match) {
            const scoreHome = match.scoreHome || [];
            const scoreAway = match.scoreAway || [];
            const currentSet = match.currentSet - 1; // 0-indexed

            // 現在のセットのスコアを初期化（必要な場合）
            while (scoreHome.length <= currentSet) scoreHome.push(0);
            while (scoreAway.length <= currentSet) scoreAway.push(0);

            // 得点したチームのスコアを+1
            if (input.teamSide === "home") {
              scoreHome[currentSet]++;
            } else {
              scoreAway[currentSet]++;
            }

            // スコアを更新
            await db.updateMatch(input.matchId, { scoreHome, scoreAway });
          }
        }

        return { playId };
      }),

    listByMatch: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlaysByMatch(input.matchId);
      }),

    listByRally: publicProcedure
      .input(z.object({ rallyId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlaysByRally(input.rallyId);
      }),

    getPlayerStats: publicProcedure
      .input(z.object({ playerId: z.number() }))
      .query(async ({ input }) => {
        const plays = await db.getPlaysByPlayer(input.playerId);
        
        const totalPlays = plays.length;
        const successfulPlays = plays.filter((p: any) => p.result === "point" || p.result === "continue").length;
        const points = plays.filter((p: any) => p.result === "point").length;
        const errors = plays.filter((p: any) => p.result === "error").length;
        
        // プレータイプ別統計
        const byPlayType: Record<string, { total: number; successful: number }> = {};
        plays.forEach((play: any) => {
          if (!byPlayType[play.playType]) {
            byPlayType[play.playType] = { total: 0, successful: 0 };
          }
          byPlayType[play.playType].total++;
          if (play.result === "point" || play.result === "continue") {
            byPlayType[play.playType].successful++;
          }
        });
        
        return {
          totalPlays,
          successfulPlays,
          points,
          errors,
          byPlayType,
        };
      }),

    delete: publicProcedure
      .input(z.object({ playId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePlay(input.playId);
        return { success: true };
      }),
  }),

  // AI分析
  aiAnalyses: router({
    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        scope: z.string(),
        prompt: z.string(),
        response: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysisId = await db.createAIAnalysis({
          ...input,
          model: "gemini-pro",
          userId: ctx.user.id,
        });
        return { analysisId };
      }),

    listByMatch: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAIAnalysesByMatch(input.matchId);
      }),
  }),

  // AI分析とPDF出力
  analysis: router({
    generate: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        scope: z.enum(["timeout", "set_end", "match_end"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { generateMatchAnalysis } = await import("./analysis");
        const analysis = await generateMatchAnalysis(input);
        
        // 分析結果をデータベースに保存
        const analysisId = await db.createAIAnalysis({
          matchId: input.matchId,
          scope: input.scope,
          model: "gemini-pro",
          prompt: `Analysis for ${input.scope}`,
          response: analysis.summary,
          userId: ctx.user.id,
        });

        return { analysisId, analysis };
      }),

    exportPDF: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ input }) => {
        const { generateMatchReportPDF } = await import("./analysis");
        const pdfBuffer = await generateMatchReportPDF(input.matchId);
        
        // PDFをBase64エンコードして返す
        const pdfBase64 = pdfBuffer.toString("base64");
        return { pdf: pdfBase64 };
      }),
  }),

  // 統計
  statistics: router({
    getMatchStatistics: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        const { calculateMatchStatistics } = await import("./statistics");
        return await calculateMatchStatistics(input.matchId);
      }),

    getHeatmapData: publicProcedure
      .input(z.object({
        matchId: z.number(),
        playType: z.enum(["serve", "receive", "attack", "block"]),
      }))
      .query(async ({ input }) => {
        const { getHeatmapData } = await import("./statistics");
        return await getHeatmapData(input.matchId, input.playType);
      }),
  }),

  // 選手交代管理
  substitutions: router({
    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        setNumber: z.number(),
        teamSide: z.enum(["home", "away"]),
        playerOutId: z.number(),
        playerOutNumber: z.number(),
        playerOutName: z.string(),
        playerInId: z.number(),
        playerInNumber: z.number(),
        playerInName: z.string(),
        isLibero: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const substitutionId = await db.createSubstitution(input);
        return { substitutionId };
      }),

    listByMatch: publicProcedure
      .input(z.object({ 
        matchId: z.number(),
        setNumber: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSubstitutionsByMatch(input.matchId, input.setNumber);
      }),
  }),

  // タイムアウト管理
  timeouts: router({
    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        setNumber: z.number(),
        teamSide: z.enum(["home", "away"]),
        homeScore: z.number(),
        awayScore: z.number(),
        duration: z.number().optional(),
        type: z.enum(["technical", "regular"]).default("regular"),
      }))
      .mutation(async ({ input }) => {
        const timeoutId = await db.createTimeout(input);
        return { timeoutId };
      }),

    listByMatch: publicProcedure
      .input(z.object({ 
        matchId: z.number(),
        setNumber: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTimeoutsByMatch(input.matchId, input.setNumber);
      }),
  }),

  // サーブ順管理
  serveOrders: router({
    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        setNumber: z.number(),
        teamSide: z.enum(["home", "away"]),
        playerId: z.number(),
        playerNumber: z.number(),
        playerName: z.string(),
        position: z.number().min(1).max(6),
      }))
      .mutation(async ({ input }) => {
        const serveOrderId = await db.createServeOrder(input);
        return { serveOrderId };
      }),

    createBatch: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        setNumber: z.number(),
        teamSide: z.enum(["home", "away"]).default("home"),
        players: z.array(z.object({
          playerId: z.number(),
          playerNumber: z.number(),
          playerName: z.string(),
          position: z.number().min(1).max(6),
        })),
        liberoId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // バッチで複数のサーブ順を作成
        for (const player of input.players) {
          await db.createServeOrder({
            matchId: input.matchId,
            setNumber: input.setNumber,
            teamSide: input.teamSide,
            playerId: player.playerId,
            playerNumber: player.playerNumber,
            playerName: player.playerName,
            position: player.position,
          });
        }
        return { success: true };
      }),

    listByMatch: publicProcedure
      .input(z.object({ 
        matchId: z.number(),
        setNumber: z.number(),
        teamSide: z.enum(["home", "away"]).default("home"),
      }))
      .query(async ({ input }) => {
        return await db.getServeOrdersByMatch(input.matchId, input.setNumber, input.teamSide);
      }),

    update: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        setNumber: z.number(),
        teamSide: z.enum(["home", "away"]),
        orders: z.array(z.object({
          position: z.number().min(1).max(6),
          playerId: z.number(),
          playerNumber: z.number(),
          playerName: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        await db.updateServeOrder(input.matchId, input.setNumber, input.teamSide, input.orders);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
