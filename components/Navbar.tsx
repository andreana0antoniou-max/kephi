import Link from "next/link";
import KephiMark from "@/components/KephiMark";

export default function Navbar() {
  return (
    <header className="border-b border-ink/10 bg-cream/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <KephiMark size={28} />
          <span className="font-heading font-semibold text-xl tracking-tight text-ink">
            Kephi
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold text-ink">
          <Link href="/" className="hover:text-tangerine transition-colors">
            Find entertainers
          </Link>
          <Link
            href="/signup"
            className="hover:text-tangerine transition-colors hidden sm:inline"
          >
            List your act
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-ink text-cream hover:bg-tangerine transition-colors"
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
