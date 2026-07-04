"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ParentNameForm({ initialName }: { initialName: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.auth.updateUser({ data: { name } });

    setSaving(false);
    if (!error) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="flex-1 rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-full px-5 py-3 bg-tangerine text-white font-bold hover:bg-ink transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
      {saved && <span className="text-teal text-sm font-semibold">Saved!</span>}
    </form>
  );
}
