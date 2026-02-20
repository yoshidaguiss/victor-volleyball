import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// 環境変数から暗号化キーを取得（本番環境では必ず設定すること）
const ENCRYPTION_SECRET = process.env.API_KEY_ENCRYPTION_SECRET || "default-secret-key-change-in-production";

/**
 * APIキーを暗号化
 */
export function encryptApiKey(plaintext: string): string {
  // ソルトを生成
  const salt = crypto.randomBytes(SALT_LENGTH);

  // 暗号化キーを導出
  const key = crypto.pbkdf2Sync(ENCRYPTION_SECRET, salt, ITERATIONS, KEY_LENGTH, "sha512");

  // IVを生成
  const iv = crypto.randomBytes(IV_LENGTH);

  // 暗号化
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  // 認証タグを取得
  const tag = cipher.getAuthTag();

  // salt + iv + tag + encrypted を結合してBase64エンコード
  const result = Buffer.concat([salt, iv, tag, encrypted]);
  return result.toString("base64");
}

/**
 * APIキーを復号化
 */
export function decryptApiKey(ciphertext: string): string {
  // Base64デコード
  const buffer = Buffer.from(ciphertext, "base64");

  // salt, iv, tag, encrypted を分離
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // 暗号化キーを導出
  const key = crypto.pbkdf2Sync(ENCRYPTION_SECRET, salt, ITERATIONS, KEY_LENGTH, "sha512");

  // 復号化
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
