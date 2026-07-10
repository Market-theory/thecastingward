import Link from "next/link";
import type { Talent } from "@/lib/types";

function unionBadge(union: string): { label: string; cls: string } | null {
  const u = union.toUpperCase();
  if (u.includes("SAG-AFTRA") && !u.includes("ELIGIBLE"))
    return { label: "SAG-AFTRA", cls: "bg-garnet-700 text-white" };
  if (u.includes("ELIGIBLE")) return { label: "SAG-E", cls: "bg-brass-500 text-garnet-900" };
  if (u.includes("NON-UNION")) return { label: "NON-UNION", cls: "bg-ink/70 text-white" };
  if (u.includes("AEA")) return { label: "AEA", cls: "bg-garnet-700 text-white" };
  return null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export default function TalentCard({ talent, agencyName }: { talent: Talent; agencyName: string }) {
  const badge = unionBadge(talent.union);
  return (
    <Link
      href={`/talent/${talent.id}`}
      className="hairline group block overflow-hidden rounded-2xl bg-white transition active:scale-[0.98]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-garnet-100">
        {talent.headshotUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={talent.headshotUrl}
            alt={talent.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-garnet-700/40">
            {initials(talent.name)}
          </div>
        )}
        {badge && (
          <span
            className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${badge.cls}`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="truncate text-[13px] font-semibold leading-tight">{talent.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-ink/55">
          {[talent.height, agencyName].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
    </Link>
  );
}
