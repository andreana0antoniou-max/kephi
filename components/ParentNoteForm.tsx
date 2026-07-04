"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ParentNoteForm({
  parentId,
  parentName,
}: {
  parentId: string;
  parentName: string;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("parent_notes").insert({
      parent_id: parentId,
      author_id: user.id,
      body: body.trim(),
    });

    setSaving(false);
    if (!error) {
      setBody("");
      setSaved(true);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-ink/60 hover:text-tangerine"
      >
        {saved ? "Note saved — leave another?" : `Leave a note about ${parentName}`}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-kephi card-shadow p-4 space-y-3">
      <p className="text-sm font-semibold text-ink">Note about {parentName}</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Only visible to you and this parent — e.g. how the event went."
        rows={3}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full px-5 py-2 bg-tangerine text-white text-sm font-bold hover:bg-ink transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save note"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-5 py-2 text-sm font-semibold text-ink/60 hover:bg-ink/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
