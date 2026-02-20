import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { apiKeys } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { encryptApiKey, decryptApiKey } from "../apiKeyEncryption";

export const apiKeysRouter = router({
  /**
   * ユーザーのAPIキーを取得
   */
  get: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const apiKey = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.provider, input.provider)))
        .limit(1);

      if (apiKey.length === 0) {
        return null;
      }

      // 復号化して返す（セキュリティ上、一部をマスクする）
      const decrypted = decryptApiKey(apiKey[0].encryptedKey);
      const masked = decrypted.substring(0, 8) + "..." + decrypted.substring(decrypted.length - 4);

      return {
        id: apiKey[0].id,
        provider: apiKey[0].provider,
        maskedKey: masked,
        usageCount: apiKey[0].usageCount,
        lastUsedAt: apiKey[0].lastUsedAt,
        createdAt: apiKey[0].createdAt,
      };
    }),

  /**
   * APIキーを保存または更新
   */
  save: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
        apiKey: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 暗号化
      const encrypted = encryptApiKey(input.apiKey);

      // 既存のキーを確認
      const existing = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.provider, input.provider)))
        .limit(1);

      if (existing.length > 0) {
        // 更新
        await db
          .update(apiKeys)
          .set({
            encryptedKey: encrypted,
            updatedAt: new Date(),
          })
          .where(eq(apiKeys.id, existing[0].id));

        return { success: true, message: "APIキーを更新しました" };
      } else {
        // 新規作成
        await db.insert(apiKeys).values({
          userId: ctx.user.id,
          provider: input.provider,
          encryptedKey: encrypted,
        });

        return { success: true, message: "APIキーを保存しました" };
      }
    }),

  /**
   * APIキーを削除
   */
  delete: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(apiKeys)
        .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.provider, input.provider)));

      return { success: true, message: "APIキーを削除しました" };
    }),

  /**
   * APIキーの使用回数を増やす（内部使用）
   */
  incrementUsage: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(apiKeys)
        .set({
          usageCount: sql`${apiKeys.usageCount} + 1`,
          lastUsedAt: new Date(),
        })
        .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.provider, input.provider)));

      return { success: true };
    }),

  /**
   * 復号化されたAPIキーを取得（内部使用）
   */
  getDecrypted: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const apiKey = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.userId, ctx.user.id), eq(apiKeys.provider, input.provider)))
        .limit(1);

      if (apiKey.length === 0) {
        return null;
      }

      // 復号化して返す
      const decrypted = decryptApiKey(apiKey[0].encryptedKey);

      return {
        apiKey: decrypted,
      };
    }),
});
