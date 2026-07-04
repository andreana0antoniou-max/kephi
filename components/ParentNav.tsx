"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const tabs = [
    { href: "/my-profile", label: "My profile" },
    { href: "/my-bookings", label: "My bookings" },
    { href: "/liked", label: "Liked" },
  ];

  return (
    <div className="flex items-center justify-between mb-8 border-b border-ink/10 pb-4">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              pathname === tab.href
                ? "bg-ink text-cream"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="text-sm font-semibold text-ink/60 hover:text-plum"
      >
        Log out
      </button>
    </div>
  );
}
