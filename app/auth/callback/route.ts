import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("Auth callback hit with URL:", request.url);
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/admin";

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
          console.error('Auth check error:', error);
          return NextResponse.redirect(`${origin}/login?error=auth-code-error&details=${encodeURIComponent(error.message)}`);
      }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=no-code`);
  } catch (err: any) {
    console.error('Auth callback crash:', err);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/login?error=server-error&details=${encodeURIComponent(err.message || 'Unknown error')}`);
  }
}
