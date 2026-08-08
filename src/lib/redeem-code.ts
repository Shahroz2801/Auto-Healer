import { randomBytes } from "crypto";

/** Generates a human-typeable code like "A1B2-C3D4-E5F6". */
export function generateRedeemCode() {
  const raw = randomBytes(6).toString("hex").toUpperCase();
  return raw.match(/.{1,4}/g)!.join("-");
}
