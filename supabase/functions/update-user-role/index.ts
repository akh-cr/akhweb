
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Get the user from the authorization header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // 2. Check permissions
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || userRole?.role !== 'admin') {
      throw new Error('Forbidden: Only admins can update user roles')
    }

    // 3. Admin verified. Use Service Role to update role.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, role } = await req.json()

    if (!userId || !role) {
      throw new Error('User ID and Role are required')
    }

    // Validate role
    const validRoles = ['admin', 'editor', 'user']
    if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`)
    }

    // Upsert role
    const { error: upsertError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: role }, { onConflict: 'user_id' })

    if (upsertError) {
      throw upsertError
    }

    // Optionally update user metadata if needed, but the table is the source of truth for RLS
    
    return new Response(
      JSON.stringify({ success: true, message: `User role updated to ${role}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
