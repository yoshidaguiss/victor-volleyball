import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  const connection = await createConnection(process.env.DATABASE_URL!);
  
  try {
    console.log('Running migration: 0001_remove_auth_columns.sql');
    const sql = readFileSync(join(__dirname, '../drizzle/0001_remove_auth_columns.sql'), 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await connection.execute(statement);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
