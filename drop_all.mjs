import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

await connection.query('SET FOREIGN_KEY_CHECKS = 0');

const tables = ['__drizzle_migrations', 'plays', 'rallies', 'matches', 'players', 'teams', 'aiAnalyses', 'users'];
for (const table of tables) {
  try {
    await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    console.log(`✓ ${table} 削除`);
  } catch (err) {
    console.log(`✗ ${table} エラー: ${err.message}`);
  }
}

await connection.query('SET FOREIGN_KEY_CHECKS = 1');
await connection.end();
console.log('完了');
