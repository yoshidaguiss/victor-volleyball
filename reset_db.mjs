import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('既存テーブルを削除中...');

// 外部キー制約を一時的に無効化
await connection.query('SET FOREIGN_KEY_CHECKS = 0');

// テーブルを削除
const tables = ['plays', 'rallies', 'matches', 'players', 'teams', 'aiAnalyses', 'users'];
for (const table of tables) {
  try {
    await connection.query(`DROP TABLE IF EXISTS ${table}`);
    console.log(`✓ ${table} を削除しました`);
  } catch (err) {
    console.log(`  ${table} の削除をスキップ: ${err.message}`);
  }
}

// 外部キー制約を再度有効化
await connection.query('SET FOREIGN_KEY_CHECKS = 1');

console.log('\nテーブル削除完了');
await connection.end();
