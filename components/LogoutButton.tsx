"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-full border border-ink/15 text-ink text-sm font-semibold hover:bg-ink/5 transition-colors"
    >
      Log out
    </button>
  );
}
