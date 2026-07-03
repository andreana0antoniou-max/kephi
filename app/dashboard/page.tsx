import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/DashboardNav";
import ProfileForm from "@/components/ProfileForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("entertainers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <DashboardNav />
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
      />
    </div>
  );
}
