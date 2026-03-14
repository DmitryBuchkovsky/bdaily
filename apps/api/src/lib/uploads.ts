import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { MultipartFile } from "@fastify/multipart";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export function getUploadDir(): string {
  return UPLOAD_DIR;
}

export async function ensureUploadDir(): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return map[mime] ?? ".bin";
}

export async function saveUploadedFile(
  file: MultipartFile,
): Promise<{ relativePath: string; absolutePath: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    throw new Error(`Unsupported file type: ${file.mimetype}. Allowed: PNG, JPEG, GIF, WebP, SVG`);
  }

  const buffer = await file.toBuffer();
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 2 MB");
  }

  await ensureUploadDir();
  const ext = extFromMime(file.mimetype);
  const filename = `${randomUUID()}${ext}`;
  const absolutePath = path.join(UPLOAD_DIR, filename);

  await writeFile(absolutePath, buffer);

  return { relativePath: `/uploads/${filename}`, absolutePath };
}

export async function removeFile(relativePath: string): Promise<void> {
  if (!relativePath) return;
  const filename = path.basename(relativePath);
  const absolutePath = path.join(UPLOAD_DIR, filename);
  try {
    await unlink(absolutePath);
  } catch {
    // File may already be gone
  }
}
