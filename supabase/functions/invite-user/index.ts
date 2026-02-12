import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createTransport } from 'npm:nodemailer@6.9.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Credentials retrieved from Supabase Secrets
const SMTP_CONFIG = {
    host: Deno.env.get('SMTP_HOSTNAME') ?? 'email-smtp.eu-central-1.amazonaws.com',
    port: 465,
    secure: true,
    auth: {
        user: Deno.env.get('SMTP_USER_NAME') ?? '',
        pass: Deno.env.get('SMTP_USER_PASSWORD') ?? ''
    }
}
const DEFAULT_EMAIL = Deno.env.get('DEFAULT_EMAIL') ?? 'info@festapp.net'


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

    // 2. Check if the user is an admin by querying public.user_roles
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || userRole?.role !== 'admin') {
      throw new Error('Forbidden: Only admins can invite users')
    }

    // 3. Admin verified. Now use Service Role to perform the invite action.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, role = 'editor' } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Check if user already exists
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const existingUser = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (existingUser) {
        if (existingUser.email_confirmed_at) {
            console.warn('User already active:', email)
            throw new Error('User already active. Please reset password instead.')
        } else {
            console.log('User exists but not confirmed. Resending invite...')
            // Proceed to generate link for existing user
        }
    }

    // Use configured SITE_URL or fallback to production
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://akhweb.netlify.app'
    const redirectTo = `${siteUrl}/auth/v?next=/auth/update-password`
    
    // 4. Generate Link instead of sending email directly via Supabase (Bypassing Rate Limit)
    console.log(`Generating invite link for ${email}...`)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: email,
        options: {
            redirectTo: redirectTo
        }
    })

    if (linkError) throw linkError

    const inviteLink = linkData.properties.action_link
    console.log(`Invite link generated. Sending via Custom SMTP...`)

    // 5. Send Email via Custom SMTP
    const transporter = createTransport(SMTP_CONFIG)

    const mailOptions = {
        from: DEFAULT_EMAIL,
        to: email,
        subject: 'Pozvánka do administrace AKH webu',
        html: `
            <h2>Byli jste pozváni do administrace AKH webu</h2>
            <p>Kliknutím na odkaz níže přijmete pozvánku a nastavíte si heslo:</p>
            <p><a href="${inviteLink}">Přijmout pozvánku</a></p>
            <p>Nebo zkopírujte tento odkaz do prohlížeče:</p>
            <p>${inviteLink}</p>
        `
    }


    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')

    // 6. Assign the role in public.user_roles (User is created by generateLink)
    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: linkData.user.id, role: role })

    if (insertError) {
        console.error('Insert role failed, trying upsert', insertError)
        const { error: upsertError } = await supabaseAdmin
            .from('user_roles')
            .upsert({ user_id: linkData.user.id, role: role })
        
        if (upsertError) throw upsertError
    }

    return new Response(
      JSON.stringify({ success: true, message: `User ${email} invited as ${role}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Invite error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
