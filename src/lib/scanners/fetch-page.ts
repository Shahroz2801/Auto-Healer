import * as cheerio from "cheerio";

export type FetchedPage = {
  url: string;
  finalUrl: string;
  status: number;
  headers: Headers;
  html: string;
  $: cheerio.CheerioAPI;
  responseTimeMs: number;
  sizeBytes: number;
  redirected: boolean;
};

const USER_AGENT = "HealSiteAI-Scanner/1.0 (+https://healsite.ai/bot)";
const FETCH_TIMEOUT_MS = 15_000;

/** Fetches a single page and parses it with cheerio. Not a full headless
 * browser — no JS execution, so client-rendered content isn't visible. That's
 * an intentional v1 tradeoff (see docs/ARCHITECTURE.md); good enough for
 * server-rendered markup, meta tags, headers, and static asset checks. */
export async function fetchPage(url: string): Promise<FetchedPage> {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    const html = await res.text();

    return {
      url,
      finalUrl: res.url,
      status: res.status,
      headers: res.headers,
      html,
      $: cheerio.load(html),
      responseTimeMs: Date.now() - started,
      sizeBytes: new TextEncoder().encode(html).length,
      redirected: res.redirected,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** HEAD (falling back to GET) request used for link/asset status checks —
 * cheap enough to run dozens of times per scan without fetching full bodies. */
export async function checkUrlStatus(
  url: string
): Promise<{ ok: boolean; status: number | null }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: controller.signal,
    });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": USER_AGENT },
        redirect: "follow",
        signal: controller.signal,
      });
    }
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: null };
  } finally {
    clearTimeout(timeout);
  }
}
