import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assert, assertEquals } from 'https://deno.land/std@0.192.0/testing/asserts.ts'
import { load } from "https://deno.land/std@0.220.0/dotenv/mod.ts";

const env = await load({ envPath: '.env.local', examplePath: null });
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  Deno.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

Deno.test({
  name: 'User Management Security (Anonymous)',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async (t) => {

  await t.step('Anon CANNOT Invite User', async () => {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: { email: 'test-anon@example.com' },
    })
    // Consume body to prevent leak
    if (data) {} 
    
    // Should fail with 401 Unauthorized or 403 Forbidden
    assert(error, 'Anonymous user should NOT be able to invite users')
  })

  await t.step('Anon CANNOT Update User Role', async () => {
    const { data, error } = await supabase.functions.invoke('update-user-role', {
      body: { userId: 'some-id', role: 'editor' },
    })
    if (data) {}
    assert(error, 'Anonymous user should NOT be able to update roles')
  })

  await t.step('Anon CANNOT Delete User', async () => {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId: 'some-id' },
    })
    if (data) {}
    assert(error, 'Anonymous user should NOT be able to delete users')
  })
}})

