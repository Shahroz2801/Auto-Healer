import type { Finding, Analyzer } from "./types";
import { checkUrlStatus } from "./fetch-page";

const TITLE_MIN = 10;
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;

export const analyzeSeo: Analyzer = async (page) => {
  const { $ } = page;
  const findings: Finding[] = [];

  const title = $("title").first().text().trim();
  if (!title) {
    findings.push({
      category: "SEO",
      severity: "HIGH",
      title: "Missing <title> tag",
      description: "The page has no <title> element, which search engines use as the primary result headline.",
      impact: "Search engines will fall back to guessing a title, hurting click-through rate.",
      estSeoGain: 8,
    });
  } else if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    findings.push({
      category: "SEO",
      severity: "LOW",
      title: `Title length is ${title.length} characters`,
      description: `"${title}" — recommended length is ${TITLE_MIN}-${TITLE_MAX} characters so it doesn't get truncated in search results.`,
      estSeoGain: 2,
    });
  }

  const description = $('meta[name="description"]').attr("content")?.trim();
  if (!description) {
    findings.push({
      category: "SEO",
      severity: "MEDIUM",
      title: "Missing meta description",
      description: "No <meta name=\"description\"> tag found. Search engines generate their own snippet, which is often less compelling.",
      estSeoGain: 5,
    });
  } else if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
    findings.push({
      category: "SEO",
      severity: "LOW",
      title: `Meta description length is ${description.length} characters`,
      description: `Recommended length is ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} characters.`,
      estSeoGain: 2,
    });
  }

  const canonical = $('link[rel="canonical"]').attr("href");
  if (!canonical) {
    findings.push({
      category: "SEO",
      severity: "LOW",
      title: "Missing canonical link",
      description: "No <link rel=\"canonical\"> found. Without it, duplicate-content variants of this URL can dilute ranking signals.",
      estSeoGain: 2,
    });
  }

  const h1s = $("h1");
  if (h1s.length === 0) {
    findings.push({
      category: "SEO",
      severity: "MEDIUM",
      title: "No <h1> heading found",
      description: "Every page should have exactly one <h1> describing its main topic.",
      estSeoGain: 3,
    });
  } else if (h1s.length > 1) {
    findings.push({
      category: "SEO",
      severity: "LOW",
      title: `${h1s.length} <h1> tags found`,
      description: "Multiple <h1> tags can dilute topical relevance signals — use one <h1> and demote the rest to <h2>/<h3>.",
      estSeoGain: 1,
    });
  }

  const ogTags = ["og:title", "og:description", "og:image"].filter(
    (prop) => !$(`meta[property="${prop}"]`).attr("content")
  );
  if (ogTags.length > 0) {
    findings.push({
      category: "SEO",
      severity: "LOW",
      title: `Missing Open Graph tags: ${ogTags.join(", ")}`,
      description: "Open Graph tags control how this page looks when shared on social platforms.",
      estSeoGain: 2,
    });
  }

  if (!$('meta[name="twitter:card"]').attr("content")) {
    findings.push({
      category: "SEO",
      severity: "INFO",
      title: "Missing Twitter Card meta tag",
      description: "Add <meta name=\"twitter:card\"> so links render as rich cards on Twitter/X.",
    });
  }

  const imagesWithoutAlt = $("img:not([alt])").length;
  if (imagesWithoutAlt > 0) {
    findings.push({
      category: "SEO",
      severity: "MEDIUM",
      title: `${imagesWithoutAlt} image(s) missing alt text`,
      description: "Alt text helps search engines understand image content and is required for accessibility.",
      estSeoGain: 3,
    });
  }

  // robots.txt / sitemap.xml presence — best-effort, same-origin only.
  try {
    const origin = new URL(page.finalUrl).origin;
    const [robots, sitemap] = await Promise.all([
      checkUrlStatus(`${origin}/robots.txt`),
      checkUrlStatus(`${origin}/sitemap.xml`),
    ]);
    if (!robots.ok) {
      findings.push({
        category: "SEO",
        severity: "LOW",
        title: "robots.txt not found",
        description: `No accessible robots.txt at ${origin}/robots.txt — without one, crawlers use default behavior, which is usually fine but you lose control over crawl budget.`,
        estSeoGain: 1,
      });
    }
    if (!sitemap.ok) {
      findings.push({
        category: "SEO",
        severity: "LOW",
        title: "sitemap.xml not found",
        description: `No accessible sitemap at ${origin}/sitemap.xml — a sitemap helps search engines discover and prioritize your pages.`,
        estSeoGain: 1,
      });
    }
  } catch {
    // ignore — non-critical best-effort check
  }

  return findings;
};
