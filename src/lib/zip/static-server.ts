import { createServer, type Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, normalize, extname } from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/** Finds the site's entry HTML file inside an extracted zip. Handles the
 * common case where the zip wraps everything in a single top-level folder
 * (e.g. "my-site/index.html") by checking one level deep too. */
export async function findEntryFile(root: string): Promise<string | null> {
  const candidates = ["index.html", "index.htm"];
  for (const name of candidates) {
    if (existsSync(join(root, name))) return name;
  }

  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(root, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  if (dirs.length === 1) {
    for (const name of candidates) {
      if (existsSync(join(root, dirs[0].name, name))) return `${dirs[0].name}/${name}`;
    }
  }

  return null;
}

/** Serves an extracted static site tree over a local HTTP server so the
 * existing fetch-based scanner pipeline can run against it unmodified.
 * Binds to an OS-assigned ephemeral port on loopback only. */
export function serveStaticDir(root: string): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = createServer(async (req, res) => {
    try {
      const requestPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const filePath = normalize(join(root, relative));

      if (!filePath.startsWith(normalize(root))) {
        res.writeHead(403).end("Forbidden");
        return;
      }

      const stats = await stat(filePath).catch(() => null);
      if (!stats || !stats.isFile()) {
        res.writeHead(404).end("Not found");
        return;
      }

      const body = await readFile(filePath);
      const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType, "Content-Length": body.length });
      res.end(body);
    } catch {
      res.writeHead(500).end("Internal error");
    }
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to bind static server"));
        return;
      }
      resolve({
        url: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((res) => server.close(() => res())),
      });
    });
  });
}
