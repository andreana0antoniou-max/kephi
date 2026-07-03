"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ENTERTAINER_TYPES } from "@/lib/constants";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    router.push(`/?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-kephi card-shadow p-3 flex flex-col sm:flex-row gap-3"
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="flex-1 rounded-full border border-ink/10 px-4 py-2.5 bg-cream text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-tangerine"
      >
        <option value="">Any type of entertainer</option>
        {ENTERTAINER_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Town or city, e.g. Lancaster"
        className="flex-1 rounded-full border border-ink/10 px-4 py-2.5 bg-cream text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />

      <button
        type="submit"
        className="rounded-full px-6 py-2.5 bg-tangerine text-white font-bold hover:bg-ink transition-colors"
      >
        Search
      </button>
    </form>
  );
}
