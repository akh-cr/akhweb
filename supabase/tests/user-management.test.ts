import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assert, assertEquals } from 'https://deno.land/std@0.192.0/testing/asserts.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  Deno.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const TEST_EMAIL = `test-user-${Date.now()}@example.com`

Deno.test('User Management Flow', async (t) => {
  let createdUserId: string | null = null

  await t.step('1. Invite User', async () => {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: { email: TEST_EMAIL },
    })
    
    // Note: If user invite works, it returns success message. 
    // Typically invite returns user data if using admin api directly, but our function returns { message: ... }
    if (error) throw error
    assert(data.success, 'Invite should return success')

    // Fetch user to get ID
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === TEST_EMAIL)
    assert(user, 'User should be created in Auth')
    createdUserId = user.id
  })

  await t.step('2. Update User Role', async () => {
    assert(createdUserId, 'User ID must exist from previous step')
    
    const { data, error } = await supabase.functions.invoke('update-user-role', {
      body: { userId: createdUserId, role: 'editor' },
    })

    if (error) throw error
    assert(data.success, 'Update role should return success')

    // Verify in DB
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', createdUserId)
      .single()
    
    if (roleError) throw roleError
    assertEquals(roleData.role, 'editor', 'Role should be updated to editor')
  })

  await t.step('3. Cleanup / Delete User', async () => {
    if (!createdUserId) return

    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId: createdUserId },
    })

    if (error) throw error
    assert(data.success, 'Delete user should return success')

    // Verify deletion
    const { data: { user }, error: fetchError } = await supabase.auth.admin.getUserById(createdUserId)
    assert(fetchError || !user, 'User should not exist in Auth')
  })
})
