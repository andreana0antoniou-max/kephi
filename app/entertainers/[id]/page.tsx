import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import BookingRequestForm from "@/components/BookingRequestForm";
import BookingLoginPrompt from "@/components/BookingLoginPrompt";
import LikeButton from "@/components/LikeButton";
import { accentForType } from "@/lib/constants";

export default async function EntertainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entertainer } = await supabase
    .from("entertainers")
    .select("*")
    .eq("id", id)
    .single();

  if (!entertainer) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from("likes")
      .select("id")
      .eq("parent_id", user.id)
      .eq("entertainer_id", id)
      .maybeSingle();
    isLiked = !!like;
  }

  const { data: galleryPhotos } = await supabase
    .from("entertainer_photos")
    .select("*")
    .eq("entertainer_id", id)
    .order("created_at", { ascending: true });

  const { data: reviews } = await supabase
    .from("entertainer_reviews")
    .select("*")
    .eq("entertainer_id", id)
    .order("created_at", { ascending: false });

  const reviewCount = reviews?.length ?? 0;
  const avgRating = reviewCount
    ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
    : null;

  const accent = accentForType(entertainer.entertainer_type);
  const accentText: Record<string, string> = {
    tangerine: "text-tangerine",
    teal: "text-teal",
    plum: "text-plum",
    gold: "text-[#8a6a1e]",
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-5 gap-10">
      <div className="md:col-span-3">
        <div className="relative aspect-[4/3] rounded-kephi overflow-hidden bg-ink/5 mb-6">
          {entertainer.photo_url ? (
            <Image
              src={entertainer.photo_url}
              alt={entertainer.business_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30 font-heading text-6xl">
              {entertainer.business_name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold ${accentText[accent]}`}>
            {entertainer.entertainer_type}
          </span>
          <LikeButton
            entertainerId={entertainer.id}
            initiallyLiked={isLiked}
            isLoggedIn={!!user}
            className="w-9 h-9 rounded-full border border-ink/10 flex items-center justify-center hover:bg-ink/5 transition-colors"
          />
        </div>
        <h1 className="font-heading font-semibold text-3xl text-ink mt-1">
          {entertainer.business_name}
        </h1>
        {avgRating && (
          <p className="text-sm font-semibold text-ink/70 mt-1">
            ★ {avgRating}{" "}
            <span className="text-ink/40 font-normal">
              ({reviewCount} review{reviewCount === 1 ? "" : "s"})
            </span>
          </p>
        )}
        <p className="text-ink/60 mt-1">
          {entertainer.town}
          {entertainer.region ? `, ${entertainer.region}` : ""}
        </p>

        {entertainer.price_from && (
          <p className="mt-4 font-semibold text-ink">
            From £{entertainer.price_from} {entertainer.price_unit}
          </p>
        )}

        {entertainer.bio && (
          <p className="mt-6 text-ink/80 leading-relaxed whitespace-pre-line">
            {entertainer.bio}
          </p>
        )}

        {galleryPhotos && galleryPhotos.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading font-semibold text-lg text-ink mb-3">
              Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-ink/5"
                >
                  <Image
                    src={photo.photo_url}
                    alt={`${entertainer.business_name} — event photo`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews && reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading font-semibold text-lg text-ink mb-3">
              Reviews
            </h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-kephi card-shadow p-4">
                  <p className="text-gold">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  {review.body && (
                    <p className="text-ink/80 mt-1 whitespace-pre-line">{review.body}</p>
                  )}
                  <p className="text-xs text-ink/40 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <div className="bg-white rounded-kephi card-shadow p-6 sticky top-24">
          <h2 className="font-heading font-semibold text-xl text-ink mb-4">
            Request a booking
          </h2>
          {user ? (
            <BookingRequestForm entertainerId={entertainer.id} />
          ) : (
            <BookingLoginPrompt redirectTo={`/entertainers/${entertainer.id}`} />
          )}
        </div>
      </div>
    </div>
  );
}
