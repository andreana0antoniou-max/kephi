import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ParentNameForm from "@/components/ParentNameForm";
import NotificationSettings from "@/components/NotificationSettings";
import { ParentNote } from "@/lib/types";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/my-profile");

  const { data: notes } = await supabase
    .from("parent_notes")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false });

  const authorIds = [...new Set((notes ?? []).map((n) => n.author_id))];
  let authorNames = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: authors } = await supabase
      .from("entertainers")
      .select("id, business_name")
      .in("id", authorIds);
    authorNames = new Map((authors ?? []).map((a) => [a.id, a.business_name]));
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-heading font-semibold text-2xl text-ink mb-1">
        My profile
      </h1>
      <p className="text-ink/60 mb-8">{user.email}</p>

      <ParentNameForm initialName={(user.user_metadata?.name as string) ?? ""} />

      <div className="mt-10 pt-8 border-t border-ink/10">
        <h2 className="font-heading font-semibold text-lg text-ink mb-1">
          Notes from entertainers
        </h2>
        <p className="text-sm text-ink/60 mb-4">
          What entertainers you've booked have said about working with you.
        </p>

        {notes && notes.length > 0 ? (
          <div className="space-y-3">
            {(notes as ParentNote[]).map((note) => (
              <div key={note.id} className="bg-white rounded-kephi card-shadow p-4">
                <p className="text-ink/80 whitespace-pre-line">{note.body}</p>
                <p className="text-xs text-ink/40 mt-2">
                  {authorNames.get(note.author_id) ?? "An entertainer"} ·{" "}
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink/50 text-sm">No notes yet.</p>
        )}
      </div>

      <NotificationSettings
        initial={{ notify_messages: user.user_metadata?.notify_messages ?? true }}
        showBookingsAndLikes={false}
      />
    </div>
  );
}
