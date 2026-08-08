import type { Finding, Analyzer } from "./types";

const LARGE_PAGE_BYTES = 500_000;
const SLOW_RESPONSE_MS = 800;

export const analyzePerformance: Analyzer = (page) => {
  const { $, headers, responseTimeMs, sizeBytes } = page;
  const findings: Finding[] = [];

  if (responseTimeMs > SLOW_RESPONSE_MS) {
    findings.push({
      category: "PERFORMANCE",
      severity: responseTimeMs > 2000 ? "HIGH" : "MEDIUM",
      title: `Server response took ${responseTimeMs}ms`,
      description: "Time to first byte over 800ms delays everything after it — rendering, scripts, and interactivity.",
      estPerformanceGain: responseTimeMs > 2000 ? 10 : 4,
    });
  }

  if (sizeBytes > LARGE_PAGE_BYTES) {
    findings.push({
      category: "PERFORMANCE",
      severity: "MEDIUM",
      title: `HTML document is ${(sizeBytes / 1000).toFixed(0)}KB`,
      description: `Documents over ${LARGE_PAGE_BYTES / 1000}KB take longer to download and parse, especially on mobile networks.`,
      estPerformanceGain: 5,
    });
  }

  const contentEncoding = headers.get("content-encoding");
  if (!contentEncoding || !/br|gzip|zstd/i.test(contentEncoding)) {
    findings.push({
      category: "PERFORMANCE",
      severity: "MEDIUM",
      title: "Response is not compressed",
      description: "No gzip/brotli Content-Encoding — enabling compression typically cuts transfer size by 60-80% for text responses.",
      estPerformanceGain: 6,
    });
  }

  const cacheControl = headers.get("cache-control");
  if (!cacheControl) {
    findings.push({
      category: "PERFORMANCE",
      severity: "LOW",
      title: "Missing Cache-Control header",
      description: "Without caching directives, browsers and CDNs may re-fetch this page more often than necessary.",
      estPerformanceGain: 2,
    });
  }

  const renderBlockingScripts = $("head script[src]").filter(
    (_, el) => !$(el).attr("async") && !$(el).attr("defer") && $(el).attr("type") !== "module"
  ).length;
  if (renderBlockingScripts > 0) {
    findings.push({
      category: "PERFORMANCE",
      severity: renderBlockingScripts > 2 ? "HIGH" : "MEDIUM",
      title: `${renderBlockingScripts} render-blocking script(s) in <head>`,
      description: "Scripts in <head> without async/defer block HTML parsing until they download and execute.",
      estPerformanceGain: renderBlockingScripts > 2 ? 8 : 4,
    });
  }

  const renderBlockingStyles = $('head link[rel="stylesheet"]:not([media="print"])').length;
  if (renderBlockingStyles > 3) {
    findings.push({
      category: "PERFORMANCE",
      severity: "LOW",
      title: `${renderBlockingStyles} separate stylesheets loaded`,
      description: "Each stylesheet is a render-blocking request. Consider bundling to reduce round-trips.",
      estPerformanceGain: 2,
    });
  }

  const imagesWithoutDimensions = $("img:not([width]):not([height])").length;
  if (imagesWithoutDimensions > 0) {
    findings.push({
      category: "PERFORMANCE",
      severity: "MEDIUM",
      title: `${imagesWithoutDimensions} image(s) missing width/height`,
      description: "Images without explicit dimensions cause layout shift (poor CLS) as they load.",
      estPerformanceGain: 3,
    });
  }

  const lazyLoadCandidates = $("img:not([loading])").length;
  if (lazyLoadCandidates > 4) {
    findings.push({
      category: "PERFORMANCE",
      severity: "LOW",
      title: `${lazyLoadCandidates} images without loading="lazy"`,
      description: "Below-the-fold images without native lazy loading compete with critical resources for bandwidth.",
      estPerformanceGain: 2,
    });
  }

  return findings;
};
