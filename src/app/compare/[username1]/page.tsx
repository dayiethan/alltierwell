import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ username1: string }>;
}

export default async function CompareRedirectPage({ params }: Props) {
  const { username1 } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // If they're trying to compare with themselves, redirect to their profile
  if (profile.username === username1) {
    redirect(`/user/${username1}`);
  }

  redirect(`/compare/${profile.username}/${username1}`);
}
