import { createHash, randomBytes, pbkdf2Sync } from "crypto";

/**
 * パスワードをハッシュ化する
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * パスワードを検証する
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, originalHash] = hashedPassword.split(":");
  if (!salt || !originalHash) {
    return false;
  }
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

/**
 * 簡易的なopenIdを生成する（メールアドレスベース）
 */
export function generateOpenId(email: string): string {
  return createHash("sha256").update(email.toLowerCase()).digest("hex");
}
