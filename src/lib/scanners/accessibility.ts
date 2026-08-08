import type { Finding, Analyzer } from "./types";

export const analyzeAccessibility: Analyzer = (page) => {
  const { $ } = page;
  const findings: Finding[] = [];

  const htmlLang = $("html").attr("lang");
  if (!htmlLang) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "MEDIUM",
      title: "Missing lang attribute on <html>",
      description: "Screen readers use this to choose pronunciation rules; without it they default to the reader's own language, which may mispronounce content.",
    });
  }

  const imagesWithoutAlt = $("img:not([alt])");
  if (imagesWithoutAlt.length > 0) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "HIGH",
      title: `${imagesWithoutAlt.length} image(s) missing alt text`,
      description: "Screen reader users get no description of these images. Decorative images should use alt=\"\".",
    });
  }

  const viewport = $('meta[name="viewport"]').attr("content");
  if (!viewport) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "MEDIUM",
      title: "Missing viewport meta tag",
      description: "Without a viewport tag, mobile browsers render a desktop layout and zoom out, forcing users to pinch-zoom.",
    });
  } else if (/user-scalable=no|maximum-scale=1(\.0)?(?!\d)/i.test(viewport)) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "HIGH",
      title: "Viewport disables user zoom",
      description: `"${viewport}" prevents pinch-zoom, which low-vision users rely on.`,
    });
  }

  const inputsWithoutLabels = $("input:not([type=hidden]):not([type=submit]):not([type=button])").filter((_, el) => {
    const $el = $(el);
    const id = $el.attr("id");
    const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
    const hasAria = $el.attr("aria-label") || $el.attr("aria-labelledby");
    const wrappedInLabel = $el.parents("label").length > 0;
    return !hasLabel && !hasAria && !wrappedInLabel;
  });
  if (inputsWithoutLabels.length > 0) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "HIGH",
      title: `${inputsWithoutLabels.length} form input(s) without an associated label`,
      description: "Every form control needs a <label>, aria-label, or aria-labelledby so assistive tech can announce its purpose.",
    });
  }

  const linksWithoutText = $("a").filter((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const hasAria = $el.attr("aria-label") || $el.attr("aria-labelledby");
    const hasImgAlt = $el.find("img[alt]").filter((_, img) => !!$(img).attr("alt")?.trim()).length > 0;
    return !text && !hasAria && !hasImgAlt;
  });
  if (linksWithoutText.length > 0) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "MEDIUM",
      title: `${linksWithoutText.length} link(s) with no accessible text`,
      description: "Links with no text, aria-label, or labeled image inside are announced as just \"link\" by screen readers.",
    });
  }

  const buttonsWithoutText = $("button").filter((_, el) => {
    const $el = $(el);
    return !$el.text().trim() && !$el.attr("aria-label") && !$el.attr("aria-labelledby");
  });
  if (buttonsWithoutText.length > 0) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "MEDIUM",
      title: `${buttonsWithoutText.length} button(s) with no accessible text`,
      description: "Icon-only buttons need an aria-label describing the action.",
    });
  }

  const headingLevels = $("h1, h2, h3, h4, h5, h6")
    .map((_, el) => Number(el.tagName.slice(1)))
    .get();
  let skipped = false;
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) skipped = true;
  }
  if (skipped) {
    findings.push({
      category: "ACCESSIBILITY",
      severity: "LOW",
      title: "Heading levels skip a level",
      description: "Heading order jumps (e.g. h2 straight to h4), which breaks the document outline screen reader users navigate by.",
    });
  }

  return findings;
};
