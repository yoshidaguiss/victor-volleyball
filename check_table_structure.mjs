import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [columns] = await connection.query('SHOW COLUMNS FROM aiAnalyses');
console.log('aiAnalysesテーブルの構造:');
console.log(JSON.stringify(columns, null, 2));

await connection.end();
