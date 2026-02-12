
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data, error } = await supabase
    .from('council_members')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error('Error:', error);
  } else {
    const members = data.filter(m => ['4df72d3c-d2cd-43d7-a311-c2a8448ffb9c', 'dabc73bc-1017-40f0-97a4-67798d8981d1'].includes(m.id));
    console.log('Fetched Members:', JSON.stringify(members, null, 2));
  }
}

testFetch();
