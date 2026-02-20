import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// テーブル一覧を取得
const [tables] = await connection.query('SHOW TABLES');
console.log('=== データベース内のテーブル一覧 ===');
console.log(tables);

// 各テーブルの行数を確認
for (const table of tables) {
  const tableName = Object.values(table)[0];
  const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
  console.log(`\n${tableName}: ${count[0].count}行`);
  
  // 最初の5行を表示
  if (count[0].count > 0) {
    const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 5`);
    console.log('サンプルデータ:', JSON.stringify(rows, null, 2));
  }
}

await connection.end();
