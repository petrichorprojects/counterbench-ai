import { TriageWizard } from "@/components/playbooks/TriageWizard";

export const metadata = { title: "Playbook Triage" };

export default function PlaybookTriagePage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "5rem" }}>
        <div className="container">
          <div className="label">Triage</div>
          <h1 className="max-w-900">Generate a workflow playbook.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            60 seconds. You’ll get a recommended tool stack, prompts, skill templates, a checklist, and risk notes.
          </p>

          <div className="mt-5">
            <TriageWizard />
          </div>
        </div>
      </section>
    </main>
  );
}

