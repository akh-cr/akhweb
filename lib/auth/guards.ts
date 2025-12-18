import { createClient } from "@/lib/supabase/server"


export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  // Check role
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (!role || !['admin', 'editor'].includes(role.role)) {
    throw new Error("Forbidden: Insufficient permissions")
  }
  
  return { user, supabase }
}
