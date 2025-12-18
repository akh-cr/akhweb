const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251218_secure_rls.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Applying migration 20251218_secure_rls.sql...');
    await client.query(sql);
    
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
