const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { Client } = require('pg');

// We'll use the main connection to check roles/results, 
// ensuring the policies are actually in place on the DB side.
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database for verification...');

    // 1. Verify helper function exists
    const resFunc = await client.query("SELECT proname FROM pg_proc WHERE proname = 'is_admin_or_editor'");
    if (resFunc.rowCount === 0) {
      throw new Error('Function is_admin_or_editor() not found!');
    }
    console.log('✅ Function is_admin_or_editor() exists.');

    // 2. Verify Policies exist
    const requiredPolicies = [
      'Admins update cities',
      'Admins manage events',
      'Admins manage posts',
      'Admins manage pages'
    ];
    
    for (const policy of requiredPolicies) {
      const resPol = await client.query(`
        SELECT policyname FROM pg_policies 
        WHERE policyname = $1
      `, [policy]);
      
      if (resPol.rowCount === 0) {
         throw new Error(`Policy "${policy}" not found!`);
      }
      console.log(`✅ Policy "${policy}" exists.`);
    }

    // 3. Verify Indexes exist
    const requiredIndexes = [
      'idx_events_city_id',
      'idx_events_start_time', 
      'idx_posts_published_at'
    ];

    for (const idx of requiredIndexes) {
      const resIdx = await client.query(`
        SELECT indexname FROM pg_indexes 
        WHERE indexname = $1
      `, [idx]);
      
      if (resIdx.rowCount === 0) {
         throw new Error(`Index "${idx}" not found!`);
      }
       console.log(`✅ Index "${idx}" exists.`);
    }

    console.log('🎉 All security and optimization checks passed!');
    
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
