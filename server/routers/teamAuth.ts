import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { hashPassword, verifyPassword } from "../passwordUtils";

export const teamAuthRouter = router({
  // チーム新規登録
  register: publicProcedure
    .input(z.object({
      teamName: z.string().min(1, "チーム名を入力してください"),
      username: z.string().min(3, "ユーザーIDは3文字以上で入力してください"),
      password: z.string().min(6, "パスワードは6文字以上で入力してください"),
    }))
    .mutation(async ({ input }) => {
      // Check if username already exists
      const existing = await db.getTeamAccountByUsername(input.username);
      if (existing) {
        throw new Error("このユーザーIDは既に使用されています");
      }

      // Create team
      const teamId = await db.createTeam({
        teamName: input.teamName,
        userId: 0, // Temporary user ID
      });

      // Hash password and create account
      const hashedPassword = hashPassword(input.password);
      await db.createTeamAccount({
        teamId: teamId,
        username: input.username,
        password: hashedPassword,
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
      // Get team account
      const account = await db.getTeamAccountByUsername(input.username);
      if (!account) {
        throw new Error("ユーザーIDまたはパスワードが正しくありません");
      }

      // Verify password
      const isValid = verifyPassword(input.password, account.password);
      if (!isValid) {
        throw new Error("ユーザーIDまたはパスワードが正しくありません");
      }

      // Update last login
      await db.updateTeamAccountLastLogin(account.id);

      // Get team info
      const team = await db.getTeamById(account.teamId);
      if (!team) {
        throw new Error("チーム情報の取得に失敗しました");
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
