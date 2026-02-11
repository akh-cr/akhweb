
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assert, assertEquals, assertRejects } from 'https://deno.land/std@0.192.0/testing/asserts.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  Deno.exit(1)
}

// Service role client for setup/teardown
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Helper to create client for a specific user
const createAuthClient = async (email: string, password = 'password123') => {
  const { data: { session }, error } = await adminClient.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: `Bearer ${session?.access_token}` } },
  })
}

// Helper to create test user with role
const createTestUser = async (role: 'admin' | 'editor' | 'user') => {
  const email = `test-${role}-${Date.now()}@example.com`
  const { data: { user }, error } = await adminClient.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
  })
  if (error) throw error
  if (!user) throw new Error('User creation failed')

  // Set role if not default 'user'
  if (role !== 'user') {
     const { error: roleError } = await adminClient
        .from('user_roles')
        .upsert({ user_id: user.id, role: role }) // upsert just in case
     
     if (roleError) {
         console.error('Failed to set role:', roleError)
         throw roleError
     }
  }

  return { email, id: user.id }
}


Deno.test('RLS Security Verification', async (t) => {
  let adminUser: { email: string, id: string }
  let editorUser: { email: string, id: string }
  let regularUser: { email: string, id: string }
  
  // Setup
  await t.step('Setup Test Users', async () => {
    adminUser = await createTestUser('admin')
    editorUser = await createTestUser('editor')
    regularUser = await createTestUser('user') 
  })

  // 1. Test Posts
  await t.step('Posts Security', async (t) => {
    
    // Test: Admins can CREATE
    await t.step('Admin can CREATE post', async () => {
        const client = await createAuthClient(adminUser.email)
        const { error } = await client.from('posts').insert({
            title: 'Admin Post',
            content: 'Content',
            slug: `admin-post-${Date.now()}`,
            user_id: adminUser.id 
        })
        assert(!error, `Admin should be able to create post: ${error?.message}`)
    })

    // Test: Editors can CREATE
    await t.step('Editor can CREATE post', async () => {
        const client = await createAuthClient(editorUser.email)
        const { error } = await client.from('posts').insert({
            title: 'Editor Post',
            content: 'Content',
            slug: `editor-post-${Date.now()}`,
             user_id: editorUser.id
        })
        assert(!error, `Editor should be able to create post: ${error?.message}`)
    })

    // Test: Regular Users CANNOT CREATE
    await t.step('Regular User CANNOT CREATE post', async () => {
        const client = await createAuthClient(regularUser.email)
        const { error } = await client.from('posts').insert({
            title: 'User Post',
            content: 'Content',
            slug: `user-post-${Date.now()}`,
             user_id: regularUser.id
        })
        // Post RLS is: permissive for SELECT (public), but restrictive for ALL (admin/editor)
        // So regular user insert should fail RLS check
        assert(error, 'Regular user should NOT be able to create post')
        // Verify error code is typically 42501 (insufficient privilege) or failing RLS policy
    })
  })

   // 2. Test Events
  await t.step('Events Security', async (t) => {
    
    // Create an event as admin to test UPDATE/DELETE against
    let testEventId: string;
    
    await t.step('Setup: Admin creates event', async () => {
         const { data, error } = await adminClient.from('events').insert({
            title: 'Test Event',
            description: 'Desc',
            slug: `test-event-${Date.now()}`,
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
             user_id: adminUser.id
        }).select().single()
        
        if (error) throw error
        testEventId = data.id
    })

    // Test: Editor can UPDATE
    await t.step('Editor can UPDATE event', async () => {
        const client = await createAuthClient(editorUser.email)
        const { error } = await client.from('events')
            .update({ title: 'Updated Title' })
            .eq('id', testEventId)
        
        assert(!error, `Editor should be able to update event: ${error?.message}`)
    })

    // Test: Regular User CANNOT DELETE
    await t.step('Regular User CANNOT DELETE event', async () => {
        const client = await createAuthClient(regularUser.email)
        const { error, count } = await client.from('events').delete().eq('id', testEventId)
        
        // If the RLS policy for Delete is 'USING (is_admin_or_editor())', then rows don't match for regular user.
        // It returns null error but count 0 (if using count option, seemingly).
        // Standard supabase-js delete usually returns null error if successful or if no rows match filter.
        // But if RLS prevents *access* to modify, it might still act like "no rows found" if the USING clause filters them out.
        // Let's verify row STILL EXISTS.
        
        const { data } = await adminClient.from('events').select('id').eq('id', testEventId).single()
        assert(data, 'Event should still exist after user attempted delete')
    })
    
     // Test: Regular User CANNOT UPDATE
    await t.step('Regular User CANNOT UPDATE event', async () => {
        const client = await createAuthClient(regularUser.email)
        const { error } = await client.from('events')
            .update({ title: 'Hacked Title' })
            .eq('id', testEventId)

        // Verify change did NOT happen
        const { data } = await adminClient.from('events').select('title').eq('id', testEventId).single()
        assertEquals(data?.title, 'Updated Title', 'Title should remain as set by Editor')
    })
  })

  // 3. Test Content Blocks
  await t.step('Content Blocks Security', async (t) => {
       // Similar pattern...
       // Create block as admin
       const { data: block, error: createError } = await adminClient.from('content_blocks').insert({
           slug: `test-block-${Date.now()}`,
           content: 'Original Content',
           user_id: adminUser.id
       }).select().single()
       if (createError) throw createError

       // User tries update
       const client = await createAuthClient(regularUser.email)
       const { error } = await client.from('content_blocks')
           .update({ content: 'Hacked Content' })
           .eq('id', block.id)
       
       // Verify
       const { data: check } = await adminClient.from('content_blocks').select('content').eq('id', block.id).single()
       assertEquals(check?.content, 'Original Content', 'Content block should strictly be immutable by regular user')
  })

  // Teardown
  await t.step('Teardown', async () => {
     if(adminUser) await adminClient.auth.admin.deleteUser(adminUser.id)
     if(editorUser) await adminClient.auth.admin.deleteUser(editorUser.id)
     if(regularUser) await adminClient.auth.admin.deleteUser(regularUser.id)
  })
})
