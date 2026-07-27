/**
 * Global Window augmentation for the GTM dataLayer.
 *
 * The dataLayer accepts any object shape (GTM does not enforce types at
 * runtime), but we constrain pushes through the typed helpers in
 * lib/analytics.ts. The array itself stays typed as Record<string, unknown>
 * so GTM's own internal pushes (gtm.js, gtm.start, etc.) are also accepted.
 */
interface Window {
  dataLayer?: Array<Record<string, unknown>>;
}
