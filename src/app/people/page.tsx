import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; skill?: string | string[] }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { q, skill } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const selectedSkills = new Set(
    (Array.isArray(skill) ? skill : skill ? [skill] : []).map((s) => s.toLowerCase())
  );

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("github_username", { ascending: true })
    .returns<Profile[]>();

  const availableSkills = [...new Set((allProfiles ?? []).flatMap((p) => p.skills))].sort(
    (a, b) => a.localeCompare(b)
  );

  const people = (allProfiles ?? [])
    .filter((p) => p.github_username)
    .filter((person) => {
      const matchesQuery =
        !query ||
        (person.name ?? "").toLowerCase().includes(query) ||
        (person.github_username ?? "").toLowerCase().includes(query);
      const matchesSkills =
        selectedSkills.size === 0 ||
        person.skills.some((s) => selectedSkills.has(s.toLowerCase()));
      return matchesQuery && matchesSkills;
    });

  return (
    <div className="shell flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Find collaborators</h1>
          <p className="mt-1.5 text-sm text-[var(--text-dim)] sm:text-base">
            {people.length} of {allProfiles?.length ?? 0} builder
            {allProfiles?.length === 1 ? "" : "s"} on BuildMate
          </p>
        </div>
        <Link href="/me" className="btn-secondary w-full sm:w-auto">
          Edit your skills
        </Link>
      </div>

      <form className="mb-8 space-y-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or username…"
          className="field max-w-md"
        />
        {availableSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {availableSkills.map((s) => {
              const checked = selectedSkills.has(s.toLowerCase());
              return (
                <label key={s} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="skill"
                    value={s}
                    defaultChecked={checked}
                    className="peer sr-only"
                  />
                  <span className="chip transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[color-mix(in_oklab,var(--accent)_16%,var(--surface-2))] peer-checked:text-[var(--accent-strong)]">
                    {s}
                  </span>
                </label>
              );
            })}
            <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
              Apply filters
            </button>
            {(query || selectedSkills.size > 0) && (
              <Link href="/people" className="btn-ghost">
                Clear
              </Link>
            )}
          </div>
        )}
      </form>

      {people.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--text-dim)]">
          No collaborators match those filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <li key={person.id} className="card interactive relative flex h-full flex-col p-5 sm:p-6">
              <Link
                href={`/u/${person.github_username}`}
                className="absolute inset-0"
                aria-label={person.name ?? person.github_username ?? "View profile"}
              />
              <div className="pointer-events-none flex items-center gap-3">
                {person.avatar_url ? (
                  <Image
                    src={person.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <span className="size-10 shrink-0 rounded-full bg-[var(--surface-2)]" />
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium">
                    {person.name ?? person.github_username}
                  </h2>
                  <p className="truncate text-xs text-[var(--text-faint)]">
                    @{person.github_username}
                  </p>
                </div>
              </div>
              {person.skills.length > 0 && (
                <div className="pointer-events-none mt-auto flex flex-wrap gap-1.5 pt-3.5">
                  {person.skills.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
