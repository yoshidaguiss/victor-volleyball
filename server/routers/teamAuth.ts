import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import * as db from "../db";

export const teamAuthRouter = router({
  // チーム新規登録
  register: publicProcedure
    .input(z.object({
      teamName: z.string().min(1, "チーム名を入力してください"),
      username: z.string().min(3, "ユーザーIDは3文字以上で入力してください"),
      password: z.string().min(4, "パスワードは4文字以上で入力してください"),
    }))
    .mutation(async ({ input }) => {
      // Check if username already exists
      const existing = await db.getTeamByUsername(input.username);
      if (existing) {
        throw new Error("このユーザーIDは既に使用されています");
      }

      // Create team with auth credentials
      const teamId = await db.createTeamWithAuth({
        teamName: input.teamName,
        username: input.username,
        password: input.password,
      });

      return {
        success: true,
        team: {
          id: teamId,
          name: input.teamName,
          username: input.username,
        },
      };
    }),

  // チームログイン
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1, "ユーザーIDを入力してください"),
      password: z.string().min(1, "パスワードを入力してください"),
    }))
    .mutation(async ({ input }) => {
      // Verify credentials
      const team = await db.verifyTeamCredentials(input.username, input.password);
      if (!team) {
        throw new Error("ユーザーIDまたはパスワードが正しくありません");
      }

      return {
        success: true,
        team: {
          id: team.id,
          name: team.teamName,
          username: input.username,
        },
      };
    }),

  // ログアウト（LocalStorageベースなのでサーバー側では何もしない）
  logout: publicProcedure.mutation(() => {
    return { success: true };
  }),
});
