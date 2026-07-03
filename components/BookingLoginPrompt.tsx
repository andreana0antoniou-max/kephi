import Link from "next/link";

export default function BookingLoginPrompt({ redirectTo }: { redirectTo: string }) {
  return (
    <div className="text-center py-6">
      <p className="text-ink/70 mb-5">
        You'll need a free account to send a booking request — it just takes a
        minute, and it means the entertainer can reply straight to you.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="rounded-full px-6 py-3 bg-tangerine text-white font-bold hover:bg-ink transition-colors"
        >
          Log in
        </Link>
        <Link
          href={`/signup/parent?redirect=${encodeURIComponent(redirectTo)}`}
          className="rounded-full px-6 py-3 border border-ink/15 text-ink font-bold hover:bg-ink/5 transition-colors"
        >
          Create a free account
        </Link>
      </div>
    </div>
  );
}
