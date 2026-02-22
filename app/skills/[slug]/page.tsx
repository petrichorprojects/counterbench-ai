import { notFound } from "next/navigation";
import { MDX } from "@/components/mdx/MDX";
import { getAllSkills, getSkillBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllSkills().map((s) => ({ slug: s.slug }));
}

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getSkillBySlug(slug);
  if (!doc) notFound();
  const fm = doc.frontmatter;

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Skill</div>
          <h1 className="max-w-900">{fm.title}</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            {fm.description}
          </p>
          <div className="mt-6">
            <MDX source={doc.content} />
          </div>
        </div>
      </section>
    </main>
  );
}
