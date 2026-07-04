import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ParentNav from "@/components/ParentNav";
import EntertainerCard from "@/components/EntertainerCard";
import { Entertainer } from "@/lib/types";

export default async function LikedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/liked");

  const { data: likes } = await supabase
    .from("likes")
    .select("entertainer_id, entertainers(*)")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false });

  const entertainers = (likes ?? [])
    .map((l) => l.entertainers)
    .filter(Boolean) as unknown as Entertainer[];

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <ParentNav />
      <h1 className="font-heading font-semibold text-2xl text-ink mb-1">
        Liked entertainers
      </h1>
      <p className="text-ink/60 mb-8">
        Acts you've saved to come back to.
      </p>

      {entertainers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entertainers.map((entertainer) => (
            <EntertainerCard
              key={entertainer.id}
              entertainer={entertainer}
              isLiked
              isLoggedIn
            />
          ))}
        </div>
      ) : (
        <p className="text-ink/60">
          Nothing liked yet.{" "}
          <Link href="/" className="text-tangerine font-semibold">
            Find an entertainer
          </Link>
          .
        </p>
      )}
    </div>
  );
}
