import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assert } from 'https://deno.land/std@0.192.0/testing/asserts.ts'
import { load } from "https://deno.land/std@0.220.0/dotenv/mod.ts";

const env = await load({ envPath: '.env.local', examplePath: null });
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  Deno.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Baseline RLS guarantees for events. The organization-scoping policy must only
// widen access for authenticated organizers — never for the anonymous role.
Deno.test({
  name: 'Events RLS (Anonymous)',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async (t) => {

  await t.step('Anon CAN read events (public site)', async () => {
    const { error } = await supabase.from('events').select('id').limit(1)
    assert(!error, 'Public should be able to read events')
  })

  await t.step('Anon CANNOT insert an event', async () => {
    const { error } = await supabase
      .from('events')
      .insert({
        title: 'RLS test',
        slug: `rls-test-${crypto.randomUUID()}`,
        start_time: new Date().toISOString(),
      })
      .select()
    assert(error, 'Anonymous user must NOT be able to insert events')
  })

  await t.step('Anon CANNOT update an event', async () => {
    const { data: existing } = await supabase.from('events').select('id').limit(1)
    const id = existing?.[0]?.id
    if (!id) return // nothing to test against
    const { data, error } = await supabase
      .from('events')
      .update({ title: 'hacked-by-anon' })
      .eq('id', id)
      .select()
    // RLS blocks either with an error or by matching zero rows.
    assert(error || !data || data.length === 0, 'Anonymous user must NOT be able to update events')
  })

  await t.step('Anon CANNOT delete an event', async () => {
    const { data: existing } = await supabase.from('events').select('id').limit(1)
    const id = existing?.[0]?.id
    if (!id) return
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .select()
    assert(error || !data || data.length === 0, 'Anonymous user must NOT be able to delete events')
  })
}})
