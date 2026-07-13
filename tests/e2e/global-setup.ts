import type { FullConfig } from "@playwright/test";

/**
 * Identity guard for the system under test.
 *
 * reuseExistingServer means any process already listening on the e2e port
 * silently becomes the SUT (this suite once ran 35 tests against Grafana on
 * port 3000; 3100 is Loki's default, so moving ports alone doesn't close the
 * class). Before any test runs, assert the server at baseURL is actually the
 * Counterbench app — fail loud with the real cause instead of a wall of
 * misleading locator timeouts.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;

  const res = await fetch(baseURL);
  const html = await res.text();

  if (!/counterbench/i.test(html)) {
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "(no title)";
    throw new Error(
      `E2E identity check failed: ${baseURL} is serving "${title}", not the Counterbench app. ` +
        `Another process is likely squatting the port (reuseExistingServer treats it as the SUT). ` +
        `Free the port or set E2E_PORT to an unused one.`
    );
  }
}
