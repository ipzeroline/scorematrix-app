import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { hasAuthSession, isSameOriginMutation } from "@/lib/auth-session-server";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const AVATAR_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "profile-avatars");

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return json({ success: false, message: "Forbidden" }, 403);
  }

  const hasSession = await hasAuthSession();
  if (!hasSession && !request.headers.get("authorization")) {
    return json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Missing token" } },
      401
    );
  }

  const form = await request.formData();
  const file = form.get("file") ?? form.get("image");

  if (!(file instanceof File)) {
    return json({ success: false, message: "Missing image file" }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return json({ success: false, message: "Invalid image file" }, 400);
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return json({ success: false, message: "Image file is too large" }, 413);
  }

  const extension = IMAGE_EXTENSIONS[file.type] ?? extensionFromFileName(file.name) ?? "bin";
  const filename = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(AVATAR_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(AVATAR_UPLOAD_DIR, filename), bytes);

  const url = new URL(`/uploads/profile-avatars/${filename}`, request.url).toString();

  return json({
    success: true,
    url,
    avatarUrl: url,
    imageUrl: url,
    data: {
      url,
      avatarUrl: url,
      imageUrl: url,
    },
  });
}

function extensionFromFileName(fileName: string) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  if (!extension || extension.length > 5 || /[^a-z0-9]/.test(extension)) {
    return null;
  }
  return extension;
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: NO_CACHE_HEADERS,
  });
}
