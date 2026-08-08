import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

/** R2 is S3-API-compatible, so the plain AWS SDK v3 client works against it
 * unchanged — just point `endpoint` at the account's R2 endpoint and use
 * `region: "auto"` (R2 ignores region but the SDK requires one). */
const globalForStorage = globalThis as unknown as { r2: S3Client | undefined };

function createClient() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",
    },
  });
}

const client = globalForStorage.r2 ?? createClient();
if (process.env.NODE_ENV !== "production") globalForStorage.r2 = client;

function requireBucket() {
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket || !process.env.STORAGE_ENDPOINT || !process.env.STORAGE_ACCESS_KEY_ID) {
    throw new Error(
      "Object storage isn't configured — set STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY."
    );
  }
  return bucket;
}

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  const bucket = requireBucket();
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );
}

export async function downloadObject(key: string): Promise<Buffer> {
  const bucket = requireBucket();
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const bytes = await res.Body?.transformToByteArray();
  if (!bytes) throw new Error(`Object storage returned an empty body for key "${key}".`);
  return Buffer.from(bytes);
}
