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
      className="px-4 py-2 rounded-full border border-cream/25 text-cream text-sm font-semibold hover:bg-cream/10 transition-colors"
    >
      Log out
    </button>
  );
}
