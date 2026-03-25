import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Workshop for Legal Professionals | Counterbench.AI",
  description:
    "6-hour hands-on AI workshop for legal professionals in Boston and Buffalo. Learn AI fundamentals, prompting, workflow automation, and build a 90-day action plan.",
  alternates: { canonical: "https://counterbench.ai/workshop" },
  openGraph: {
    title: "AI Workshop for Legal Professionals | Counterbench.AI",
    description:
      "AI Is Coming For Legal — Learn It Before It Learns You. 6-hour hands-on workshop. Boston & Buffalo. Limited seats.",
    type: "website",
    url: "https://counterbench.ai/workshop",
  },
};

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
