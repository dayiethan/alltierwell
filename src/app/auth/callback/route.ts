import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function isSafeRedirectPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/rank";
  const next = isSafeRedirectPath(rawNext) ? rawNext : "/rank";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user already has a profile
        const { data: profile } = await supabase
          .from("users")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // New user — send to onboarding
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to home
  return NextResponse.redirect(`${origin}/?error=auth`);
}
