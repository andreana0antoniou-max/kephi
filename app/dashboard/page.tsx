import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import AvailabilityManager from "@/components/AvailabilityManager";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // This dashboard is for building an entertainer profile. Parent accounts
  // have their own equivalent page.
  if (user.user_metadata?.role === "parent") redirect("/my-bookings");

  const { data: existing } = await supabase
    .from("entertainers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: galleryPhotos } = await supabase
    .from("entertainer_photos")
    .select("*")
    .eq("entertainer_id", user.id)
    .order("created_at", { ascending: true });

  const { data: unavailableDates } = await supabase
    .from("unavailable_dates")
    .select("*")
    .eq("entertainer_id", user.id);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-heading font-semibold text-2xl text-ink mb-1">
        {existing ? "Edit your profile" : "Create your profile"}
      </h1>
      <p className="text-ink/60 mb-8">
        This is what parents and organisers will see when they search Kephi.
      </p>
      <ProfileForm
        userId={user.id}
        userEmail={user.email ?? ""}
        existing={existing}
        galleryPhotos={galleryPhotos ?? []}
      />
      <AvailabilityManager userId={user.id} initialDates={unavailableDates ?? []} />
    </div>
  );
}
