import { SearchWorkspace } from "@/components/SearchWorkspace";

export const metadata = {
  title: "Search"
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SearchPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const sp = (await searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const platform = typeof sp.platform === "string" ? sp.platform : "";

  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">AI Law Library</div>
          <h1 className="max-w-900">Search the library.</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            Filter by type and platform. Everything is fast, local, and designed for scanning.
          </p>

          <SearchWorkspace initialQuery={q} initialType={type} initialPlatform={platform} />
        </div>
      </section>
    </main>
  );
}

