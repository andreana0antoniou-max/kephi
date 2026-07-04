"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ENTERTAINER_TYPES, UK_REGIONS } from "@/lib/constants";
import { Entertainer, EntertainerPhoto } from "@/lib/types";

export default function ProfileForm({
  userId,
  userEmail,
  existing,
  galleryPhotos,
}: {
  userId: string;
  userEmail: string;
  existing: Entertainer | null;
  galleryPhotos: EntertainerPhoto[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState({
    business_name: existing?.business_name ?? "",
    entertainer_type: existing?.entertainer_type ?? ENTERTAINER_TYPES[0],
    bio: existing?.bio ?? "",
    price_from: existing?.price_from?.toString() ?? "",
    price_unit: existing?.price_unit ?? "per event",
    town: existing?.town ?? "",
    region: existing?.region ?? UK_REGIONS[0],
    contact_email: existing?.contact_email ?? userEmail,
    contact_phone: existing?.contact_phone ?? "",
  });
  const [photoUrl, setPhotoUrl] = useState(existing?.photo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [gallery, setGallery] = useState<EntertainerPhoto[]>(galleryPhotos);
  const [galleryUploading, setGalleryUploading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("entertainer-photos")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage
        .from("entertainer-photos")
        .getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);

    for (const file of Array.from(files)) {
      const path = `${userId}/gallery-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("entertainer-photos")
        .upload(path, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("entertainer-photos")
          .getPublicUrl(path);

        const { data: inserted } = await supabase
          .from("entertainer_photos")
          .insert({ entertainer_id: userId, photo_url: publicUrlData.publicUrl })
          .select()
          .single();

        if (inserted) {
          setGallery((prev) => [...prev, inserted as EntertainerPhoto]);
        }
      }
    }

    setGalleryUploading(false);
    e.target.value = "";
  }

  async function handleRemoveGalleryPhoto(photo: EntertainerPhoto) {
    await supabase.from("entertainer_photos").delete().eq("id", photo.id);
    setGallery((prev) => prev.filter((p) => p.id !== photo.id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("entertainers").upsert({
      id: userId,
      business_name: form.business_name,
      entertainer_type: form.entertainer_type,
      bio: form.bio || null,
      price_from: form.price_from ? Number(form.price_from) : null,
      price_unit: form.price_unit,
      town: form.town,
      region: form.region,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone || null,
      photo_url: photoUrl || null,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Profile saved!");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-ink/5 flex-shrink-0">
          {photoUrl ? (
            <Image src={photoUrl} alt="Profile photo" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30 font-heading text-2xl">
              {form.business_name.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div>
          <label className="inline-block rounded-full px-4 py-2 bg-ink text-cream text-sm font-semibold cursor-pointer hover:bg-tangerine transition-colors">
            {uploading ? "Uploading..." : "Upload profile photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <input
        required
        placeholder="Business / act name"
        value={form.business_name}
        onChange={(e) => update("business_name", e.target.value)}
        className="w-full rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          value={form.entertainer_type}
          onChange={(e) => update("entertainer_type", e.target.value)}
          className="rounded-full border border-ink/10 px-5 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-tangerine"
        >
          {ENTERTAINER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={form.region}
          onChange={(e) => update("region", e.target.value)}
          className="rounded-full border border-ink/10 px-5 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-tangerine"
        >
          {UK_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <input
        required
        placeholder="Town / city"
        value={form.town}
        onChange={(e) => update("town", e.target.value)}
        className="w-full rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="number"
          min="0"
          placeholder="Price from (£)"
          value={form.price_from}
          onChange={(e) => update("price_from", e.target.value)}
          className="rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <select
          value={form.price_unit}
          onChange={(e) => update("price_unit", e.target.value)}
          className="rounded-full border border-ink/10 px-5 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-tangerine"
        >
          <option value="per event">per event</option>
          <option value="per hour">per hour</option>
        </select>
      </div>

      <textarea
        placeholder="Tell parents and organisers about your act..."
        value={form.bio}
        onChange={(e) => update("bio", e.target.value)}
        rows={5}
        className="w-full rounded-2xl border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          type="email"
          placeholder="Contact email"
          value={form.contact_email}
          onChange={(e) => update("contact_email", e.target.value)}
          className="rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
        <input
          placeholder="Contact phone (optional)"
          value={form.contact_phone}
          onChange={(e) => update("contact_phone", e.target.value)}
          className="rounded-full border border-ink/10 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-tangerine"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full px-6 py-3 bg-tangerine text-white font-bold hover:bg-ink transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save profile"}
      </button>

      {message && (
        <p className="text-center text-sm font-semibold text-teal">{message}</p>
      )}

      <div className="pt-6 border-t border-ink/10">
        <h2 className="font-heading font-semibold text-lg text-ink mb-1">
          Gallery photos
        </h2>
        <p className="text-sm text-ink/60 mb-4">
          Show off past events — parents can see these on your profile
          alongside your bio.
        </p>

        {gallery.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {gallery.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-ink/5">
                <Image src={photo.photo_url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryPhoto(photo)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/70 text-white text-xs font-bold flex items-center justify-center hover:bg-plum"
                  aria-label="Remove photo"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="inline-block rounded-full px-4 py-2 border border-ink/15 text-ink text-sm font-semibold cursor-pointer hover:bg-ink/5 transition-colors">
          {galleryUploading ? "Uploading..." : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            className="hidden"
            disabled={galleryUploading}
          />
        </label>
      </div>
    </form>
  );
}
