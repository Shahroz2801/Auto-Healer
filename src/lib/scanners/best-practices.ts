import type { Finding, Analyzer } from "./types";
import { checkUrlStatus } from "./fetch-page";

const MAX_LINKS_CHECKED = 15;

export const analyzeBestPractices: Analyzer = (page) => {
  const { $, html } = page;
  const findings: Finding[] = [];

  if (!/^<!doctype html>/i.test(html.trim())) {
    findings.push({
      category: "BEST_PRACTICES",
      severity: "LOW",
      title: "Missing or non-standard doctype",
      description: "A proper <!DOCTYPE html> ensures browsers render in standards mode instead of quirks mode.",
    });
  }

  if ($("script:contains('document.write')").length > 0) {
    findings.push({
      category: "BEST_PRACTICES",
      severity: "MEDIUM",
      title: "document.write() detected",
      description: "document.write() blocks parsing and is unreliable on slow connections — it can even wipe the page if called late.",
    });
  }

  if ($('meta[http-equiv="refresh"]').length > 0) {
    findings.push({
      category: "BEST_PRACTICES",
      severity: "MEDIUM",
      title: "Meta refresh redirect detected",
      description: "Meta-refresh redirects are jarring for users and screen readers, and are treated as a soft-404 signal by some crawlers.",
    });
  }

  const deprecatedTags = ["font", "center", "marquee", "blink"].filter((tag) => $(tag).length > 0);
  if (deprecatedTags.length > 0) {
    findings.push({
      category: "CODE_QUALITY",
      severity: "LOW",
      title: `Deprecated HTML tag(s) in use: ${deprecatedTags.join(", ")}`,
      description: "These tags were removed from the HTML5 spec — replace with CSS equivalents.",
    });
  }

  const inlineStyles = $("[style]").length;
  if (inlineStyles > 10) {
    findings.push({
      category: "CODE_QUALITY",
      severity: "INFO",
      title: `${inlineStyles} elements use inline style attributes`,
      description: "Heavy use of inline styles makes CSS harder to maintain and prevents caching/reuse.",
    });
  }

  return findings;
};

/** Checks a bounded sample of same-origin links for broken status codes — a
 * full-site crawl would need queueing every discovered page as its own job,
 * which is future scope; this catches the common case of a few dead links
 * on the scanned page itself. */
export const analyzeBrokenLinks: Analyzer = async (page) => {
  const { $, finalUrl } = page;
  const findings: Finding[] = [];
  const origin = new URL(finalUrl).origin;

  const hrefs = $("a[href]")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter((href): href is string => !!href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:"))
    .map((href) => {
      try {
        return new URL(href, finalUrl).toString();
      } catch {
        return null;
      }
    })
    .filter((href): href is string => !!href)
    .slice(0, MAX_LINKS_CHECKED);

  const uniqueHrefs = [...new Set(hrefs)];
  const results = await Promise.all(
    uniqueHrefs.map(async (href) => ({ href, ...(await checkUrlStatus(href)) }))
  );

  const broken = results.filter((r) => !r.ok);
  for (const b of broken) {
    findings.push({
      category: "BROKEN_LINKS",
      severity: b.href.startsWith(origin) ? "HIGH" : "LOW",
      title: `Broken link: ${b.href}`,
      description: `Returned ${b.status ?? "no response"} — ${b.href.startsWith(origin) ? "an internal link" : "an external link"} on this page is dead.`,
    });
  }

  return findings;
};
