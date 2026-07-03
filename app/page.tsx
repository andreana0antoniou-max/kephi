import { createClient } from "@/lib/supabase/server";
import EntertainerCard from "@/components/EntertainerCard";
import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import { Entertainer } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; location?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("entertainers")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.type) {
    query = query.eq("entertainer_type", params.type);
  }
  if (params.location) {
    query = query.ilike("town", `%${params.location}%`);
  }

  const { data: entertainers } = await query;

  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-10 text-center">
        <h1 className="font-heading font-semibold text-4xl sm:text-5xl text-ink leading-tight">
          Find the <span className="text-tangerine">κέφι</span> for your
          next event
        </h1>
        <p className="mt-4 text-ink/70 max-w-xl mx-auto">
          Kephi connects parents and event organisers with brilliant local
          entertainers — clowns, magicians, face painters, DJs and more.
        </p>
        <div className="mt-8 max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-20">
        {entertainers && entertainers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entertainers.map((entertainer: Entertainer) => (
              <EntertainerCard key={entertainer.id} entertainer={entertainer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Image src="/kephi-mark.png" alt="" width={44} height={44} className="mx-auto mb-4 rounded-xl" />
            <p className="font-heading text-xl text-ink">No entertainers found yet</p>
            <p className="text-ink/60 mt-2">
              Try a different search, or be the first to{" "}
              <a href="/signup" className="text-tangerine font-semibold">
                list your act
              </a>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
