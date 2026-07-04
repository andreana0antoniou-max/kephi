import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEntertainer = false;
  if (user) {
    const { data } = await supabase
      .from("entertainers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    isEntertainer = !!data;
  }

  return (
    <header className="border-b border-ink/10 bg-cream/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/kephi-mark.png" alt="" width={42} height={42} className="rounded-lg" />
          <span className="font-heading font-semibold text-xl tracking-tight text-ink">
            Kephi
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold text-ink">
          <Link href="/" className="hover:text-tangerine transition-colors">
            Find entertainers
          </Link>

          {!user && (
            <Link
              href="/signup"
              className="hover:text-tangerine transition-colors hidden sm:inline"
            >
              List your act
            </Link>
          )}

          {user && isEntertainer && (
            <Link
              href="/dashboard"
              className="hover:text-tangerine transition-colors hidden sm:inline"
            >
              My Profile
            </Link>
          )}

          {user && !isEntertainer && (
            <Link
              href="/my-profile"
              className="hover:text-tangerine transition-colors hidden sm:inline"
            >
              My Profile
            </Link>
          )}

          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-ink text-cream hover:bg-tangerine transition-colors"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
