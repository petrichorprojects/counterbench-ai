import { redirect } from "next/navigation";

export function generateMetadata() {
  return {
    title: "AI for Legal Workshop — CounterbenchAI",
    robots: { index: false },
  };
}

export default function WorkshopsRedirect() {
  redirect("/workshop");
}
