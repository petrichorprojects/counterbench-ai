import Link from "next/link";
import type { ComponentProps } from "react";

export function PrimaryButton({
  className,
  ...props
}: ComponentProps<typeof Link> & {
  className?: string;
}) {
  return <Link {...props} className={["cb-primaryBtn", className].filter(Boolean).join(" ")} />;
}

