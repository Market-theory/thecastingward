import Link from "next/link";
import { notFound } from "next/navigation";
import AssessControls from "@/components/AssessControls";
import { getTalentPageData } from "@/lib/airtable";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 border-b border-ink/8 py-2.5 text-[14px] last:border-0">
      <span className="shrink-0 text-ink/50">{label}</span>
      <span className="whitespace-pre-wrap text-right font-medium">{value}</span>
    </div>
  );
}

export default async function TalentPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await getTalentPageData(id);
  if (!data) notFound();
  const { talent, agencies, submitted, shortlisted } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <header className="frosted sticky top-0 z-10 -mx-4 flex items-center gap-3 px-4 py-3">
        <Link
          href="/"
          className="rounded-full px-2 py-1 text-[15px] font-medium text-garnet-700 active:opacity-60"
        >
          ‹ Roster
        </Link>
      </header>

      <div className="mt-2 gap-6 sm:flex">
        <div className="hairline mx-auto w-64 shrink-0 overflow-hidden rounded-2xl bg-garnet-100 sm:mx-0">
          {talent.headshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={talent.headshotUrl} alt={talent.name} className="w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center text-5xl font-semibold text-garnet-700/40">
              {talent.name
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
          )}
        </div>

        <div className="mt-5 flex-1 sm:mt-0">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-garnet-800">
            {talent.name}
          </h1>
          <p className="mt-1 text-[14px] text-ink/55">
            {[talent.union, talent.height, talent.lane].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {talent.assessedTier && (
              <span className="rounded-md bg-brass-500 px-2 py-0.5 text-[11px] font-bold text-garnet-900">
                {talent.assessedTier.toUpperCase()}
              </span>
            )}
            {talent.dataConfidence && (
              <span className="rounded-md bg-ink/8 px-2 py-0.5 text-[11px] font-semibold text-ink/60">
                {talent.dataConfidence}
              </span>
            )}
            {talent.engagement && (
              <span className="rounded-md bg-garnet-100 px-2 py-0.5 text-[11px] font-semibold text-garnet-700">
                {talent.engagement}
              </span>
            )}
          </div>
          {talent.actorsAccessUrl && (
            <a
              href={talent.actorsAccessUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block rounded-full bg-garnet-700 px-4 py-2 text-[13px] font-semibold text-white active:opacity-80"
            >
              Actors Access resume ↗
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <AssessControls
          recordId={talent.id}
          assessedTier={talent.assessedTier}
          dataConfidence={talent.dataConfidence}
        />

        <section className="hairline rounded-2xl bg-white p-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink/45">Profile</h2>
          <div className="mt-1">
            <Row label="Union" value={talent.union} />
            <Row label="Height" value={talent.height} />
            <Row label="Weight" value={talent.weight} />
            <Row label="Vocal range" value={talent.vocalRange} />
            <Row label="Skills" value={talent.skills} />
          </div>
        </section>

        <section className="hairline rounded-2xl bg-white p-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink/45">
            Representation
          </h2>
          <div className="mt-1">
            <Row label="Status" value={talent.repStatus} />
            <Row label="Agency" value={agencies.join(", ")} />
            <Row label="Detail" value={talent.repDetail} />
          </div>
        </section>

        <section className="hairline rounded-2xl bg-white p-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink/45">
            Casting history
          </h2>
          <div className="mt-1">
            <Row label="Submitted for" value={submitted.join("\n")} />
            <Row label="Shortlisted for" value={shortlisted.join("\n")} />
            <Row label="BE appearances" value={talent.beAppearances?.toString()} />
            <Row label="Submission notes" value={talent.submissionNotes} />
          </div>
        </section>

        <section className="hairline rounded-2xl bg-white p-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink/45">Source</h2>
          <div className="mt-1">
            <Row label="BE Resume ID" value={talent.beResumeId} />
            <Row label="Lane" value={talent.lane} />
          </div>
        </section>
      </div>
    </main>
  );
}
