import { LegalStoriesLessonBuilder } from "@/components/LegalStoriesLessonBuilder";
import { getLegalStoriesDoctrines, getLegalStoriesModelStats, getLegalStoriesStats } from "@/lib/legalstories";

export const metadata = {
  title: "LegalStories Lesson Pack Builder"
};

export default function LegalStoriesLessonBuilderPage() {
  const doctrines = getLegalStoriesDoctrines();
  const modelStats = getLegalStoriesModelStats();
  const stats = getLegalStoriesStats();

  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">Turn LegalStories into an actionable legal-literacy curriculum.</h1>
          <p className="max-w-820 mt-4" style={{ fontSize: "1.125rem" }}>
            Build doctrine lesson packs by complexity tier, audience, and question mix using {stats.doctrineCount} published concepts from the LegalStories corpus.
          </p>

          <LegalStoriesLessonBuilder doctrines={doctrines} modelStats={modelStats} />
        </div>
      </section>
    </main>
  );
}
