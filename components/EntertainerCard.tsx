import Link from "next/link";
import Image from "next/image";
import { Entertainer } from "@/lib/types";
import { accentForType } from "@/lib/constants";

const accentClasses: Record<string, string> = {
  tangerine: "bg-tangerine/10 text-tangerine",
  teal: "bg-teal/10 text-teal",
  plum: "bg-plum/10 text-plum",
  gold: "bg-gold/10 text-[#8a6a1e]",
};

export default function EntertainerCard({ entertainer }: { entertainer: Entertainer }) {
  const accent = accentForType(entertainer.entertainer_type);

  return (
    <Link
      href={`/entertainers/${entertainer.id}`}
      className="group block rounded-kephi overflow-hidden bg-white card-shadow hover:-translate-y-1 transition-transform"
    >
      <div className="relative aspect-[4/3] bg-ink/5">
        {entertainer.photo_url ? (
          <Image
            src={entertainer.photo_url}
            alt={entertainer.business_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-heading text-4xl">
            {entertainer.business_name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4">
        <span
          className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${accentClasses[accent]}`}
        >
          {entertainer.entertainer_type}
        </span>
        <h3 className="font-heading font-semibold text-lg text-ink leading-tight group-hover:text-tangerine transition-colors">
          {entertainer.business_name}
        </h3>
        <p className="text-sm text-ink/60 mt-1">{entertainer.town}</p>
        {entertainer.price_from && (
          <p className="text-sm font-semibold text-ink mt-2">
            From £{entertainer.price_from} {entertainer.price_unit}
          </p>
        )}
      </div>
    </Link>
  );
}
