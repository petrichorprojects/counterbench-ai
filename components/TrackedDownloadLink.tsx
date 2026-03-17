"use client";

export function TrackedDownloadLink({
  href,
  label,
  guideSlug,
}: {
  href: string;
  label: string;
  guideSlug: string;
}) {
  return (
    <a
      className="btn btn--secondary btn--sm"
      href={href}
      onClick={() => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "guide_download",
          guide_slug: guideSlug,
          file_label: label,
          file_url: href,
        });
      }}
    >
      {label}
    </a>
  );
}
