import type { Finding, Analyzer } from "./types";

const RECOMMENDED_HEADERS: Array<{
  header: string;
  severity: Finding["severity"];
  description: string;
}> = [
  {
    header: "strict-transport-security",
    severity: "HIGH",
    description: "HSTS forces browsers to only connect over HTTPS, preventing downgrade/SSL-stripping attacks.",
  },
  {
    header: "content-security-policy",
    severity: "HIGH",
    description: "A CSP restricts which scripts/styles/frames can load, mitigating XSS and data-injection attacks.",
  },
  {
    header: "x-content-type-options",
    severity: "MEDIUM",
    description: "Without \"nosniff\", browsers may MIME-sniff responses in ways that enable content-type confusion attacks.",
  },
  {
    header: "x-frame-options",
    severity: "MEDIUM",
    description: "Without this (or a CSP frame-ancestors directive), the page can be embedded in a clickjacking iframe.",
  },
  {
    header: "referrer-policy",
    severity: "LOW",
    description: "Without a Referrer-Policy, full URLs (potentially including sensitive query params) leak to third parties on outbound links.",
  },
  {
    header: "permissions-policy",
    severity: "INFO",
    description: "A Permissions-Policy explicitly restricts access to browser features like camera/microphone/geolocation.",
  },
];

export const analyzeSecurity: Analyzer = (page) => {
  const findings: Finding[] = [];
  const { headers, $, finalUrl } = page;

  const isHttps = finalUrl.startsWith("https://");
  if (!isHttps) {
    findings.push({
      category: "SECURITY",
      severity: "CRITICAL",
      title: "Site is not served over HTTPS",
      description: `${finalUrl} loaded over plain HTTP. All traffic — including any forms — is unencrypted and interceptable.`,
      impact: "Browsers flag HTTP sites as \"Not Secure\"; credentials and cookies can be intercepted on the network.",
    });
  }

  for (const { header, severity, description } of RECOMMENDED_HEADERS) {
    if (!headers.get(header)) {
      findings.push({
        category: "SECURITY",
        severity,
        title: `Missing ${header} header`,
        description,
      });
    }
  }

  const setCookie = headers.get("set-cookie");
  if (setCookie) {
    const cookies = setCookie.split(/,(?=[^;]+?=)/);
    const insecure = cookies.filter(
      (c) => isHttps && !/;\s*secure/i.test(c)
    );
    const noHttpOnly = cookies.filter((c) => !/;\s*httponly/i.test(c));
    if (insecure.length > 0) {
      findings.push({
        category: "SECURITY",
        severity: "MEDIUM",
        title: `${insecure.length} cookie(s) missing the Secure flag`,
        description: "Cookies set without \"Secure\" can be sent over an unencrypted connection if one is ever made.",
      });
    }
    if (noHttpOnly.length > 0) {
      findings.push({
        category: "SECURITY",
        severity: "LOW",
        title: `${noHttpOnly.length} cookie(s) missing the HttpOnly flag`,
        description: "Cookies without \"HttpOnly\" are readable by JavaScript, widening the blast radius of any XSS.",
      });
    }
  }

  if (isHttps) {
    const mixedContent = $('script[src^="http://"], link[href^="http://"], img[src^="http://"]').length;
    if (mixedContent > 0) {
      findings.push({
        category: "SECURITY",
        severity: "MEDIUM",
        title: `${mixedContent} resource(s) loaded over plain HTTP on an HTTPS page`,
        description: "Mixed content is blocked or flagged by modern browsers and can be a man-in-the-middle vector.",
      });
    }
  }

  const serverHeader = headers.get("server");
  if (serverHeader && /\d/.test(serverHeader)) {
    findings.push({
      category: "SECURITY",
      severity: "INFO",
      title: `Server header discloses version info: "${serverHeader}"`,
      description: "Revealing exact server software/version makes it easier for attackers to target known vulnerabilities.",
    });
  }

  return findings;
};
