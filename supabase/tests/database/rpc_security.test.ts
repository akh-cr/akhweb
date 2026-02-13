
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assert, assertEquals, assertRejects } from 'https://deno.land/std@0.192.0/testing/asserts.ts'
import { load } from "https://deno.land/std@0.220.0/dotenv/mod.ts";

const env = await load({ envPath: '.env.local', examplePath: null });
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';
// We need a SERVICE_ROLE_KEY to create test users/data if needed, but for now we might rely on existing data or just check errors.
// Actually, to test role-based access, we need to sign in as different users.
// We can use the anon key for anon tests.
// For admin/editor tests, we'd need to sign in as a user with those roles.
// Since we can't easily "create" an admin without service role, we will assume
// 1. Anon tests
// 2. We can try to use a "fake" admin token if we had service role, but strict RLS testing often needs real users.
// However, checking "Anon Failure" is the most critical part for "Public Security".
// Checking "Admin Success" is for functionality.

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  Deno.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

Deno.test({
  name: 'RPC Security Verification',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async (t) => {

    // 1. get_news_feed (Public, Security Invoker)
    await t.step('get_news_feed: Public Access & RLS', async (t) => {
        
        // Test: Anon calling with defaults -> Should succeed
        await t.step('Anon can call with defaults', async () => {
            const { data, error } = await supabase.rpc('get_news_feed')
            assert(!error, `Anon should be able to call get_news_feed: ${error?.message}`)
            // Ensure no hidden items are returned
            if (data && data.length > 0) {
                const hiddenItems = data.filter((item: any) => item.is_hidden === true)
                assertEquals(hiddenItems.length, 0, 'Anon should NOT see hidden items by default')
            }
        })

        // Test: Anon calling with include_hidden=true -> Should NOT return hidden items (RLS)
        await t.step('Anon cannot force include_hidden', async () => {
             const { data, error } = await supabase.rpc('get_news_feed', { p_include_hidden: true })
             assert(!error, `Anon call shouldn't error completely, but result must be filtered: ${error?.message}`)
             
             if (data && data.length > 0) {
                 const hiddenItems = data.filter((item: any) => item.is_hidden === true)
                 assertEquals(hiddenItems.length, 0, 'Anon MUST NOT see hidden items even if requested')
             }
        })
    })

    // 2. get_users_with_roles (Admin Only)
    await t.step('get_users_with_roles: Admin Only', async (t) => {
        // Test: Anon -> Fail
        await t.step('Anon cannot call get_users_with_roles', async () => {
            const { error } = await supabase.rpc('get_users_with_roles')
            assert(error, 'Anon should fail to call get_users_with_roles')
            // Expecting "Access denied" or generic error from the RPC's internal check
            const isAccessDenied = error.message.includes('Access denied') || error.message.includes('permission denied');
            assert(isAccessDenied, `Error should be Access denied, got: ${error.message}`)
        })
    })

    // 3. get_admin_news_feed (Admin/Editor Only)
    await t.step('get_admin_news_feed: Admin/Editor Only', async (t) => {
        // Test: Anon -> Fail
        await t.step('Anon cannot call get_admin_news_feed', async () => {
            const { error } = await supabase.rpc('get_admin_news_feed')
            assert(error, 'Anon should fail to call get_admin_news_feed')
            const isAccessDenied = error.message.includes('Access denied') || error.message.includes('permission denied');
            assert(isAccessDenied, `Error should be Access denied, got: ${error.message}`)
        })
    })

  }
})
