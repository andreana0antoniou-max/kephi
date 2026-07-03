"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
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
        New to Kephi?{" "}
        <a href="/signup" className="text-tangerine font-semibold">
          List your act
        </a>
      </p>
    </div>
  );
}
