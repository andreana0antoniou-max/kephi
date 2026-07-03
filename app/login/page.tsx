"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    } else {
      // No specific place to return to — send entertainers to their
      // dashboard, and everyone else to the homepage.
      const { data: entertainer } = await supabase
        .from("entertainers")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();
      router.push(entertainer ? "/dashboard" : "/");
    }
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-heading font-semibold text-3xl text-ink text-center">
        Log in
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        {error && (
          <p className="text-plum text-sm font-semibold text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full px-6 py-3 bg-tangerine text-white font-bold hover:bg-ink transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        Looking to book an entertainer?{" "}
        <a
          href={`/signup/parent${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-tangerine font-semibold"
        >
          Create a free account
        </a>
      </p>
      <p className="text-center text-sm text-ink/60 mt-2">
        Are you an entertainer?{" "}
        <a href="/signup" className="text-tangerine font-semibold">
          List your act
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
