import AdmZip from "adm-zip";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type ExtractedZip = {
  dir: string;
  cleanup: () => void;
};

/** Extracts a zip buffer into a fresh temp directory. Callers must call
 * `cleanup()` once done (in a `finally`) so scan workers don't leak temp
 * dirs across jobs. */
export function extractZip(buffer: Buffer): ExtractedZip {
  const dir = mkdtempSync(join(tmpdir(), "healsite-zip-"));
  const zip = new AdmZip(buffer);
  zip.extractAllTo(dir, true);

  return {
    dir,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
