import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET!;

/**
 * Generate a presigned URL for uploading a file to S3/R2.
 */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

/**
 * Delete a file from S3/R2.
 */
export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3.send(command);
}

/**
 * Get the public URL for a stored file.
 */
export function getPublicUrl(key: string) {
  const endpoint = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
  return `${endpoint}/${BUCKET}/${key}`;
}

/**
 * Generate a unique key for a file upload.
 */
export function generateKey(
  folder: string,
  filename: string,
  userId?: string
) {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const prefix = userId ? `${userId}/` : "";
  return `${folder}/${prefix}${timestamp}-${sanitized}`;
}
