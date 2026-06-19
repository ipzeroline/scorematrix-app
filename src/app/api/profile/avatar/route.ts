import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
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
  const previousAvatarUrl = stringValue(
    form.get("previousAvatarUrl") ?? form.get("previous_avatar_url")
  );

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
  const nextAvatarPath = path.join(AVATAR_UPLOAD_DIR, filename);
  await writeFile(nextAvatarPath, bytes);
  await deletePreviousAvatar(previousAvatarUrl, request.url, nextAvatarPath);

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

async function deletePreviousAvatar(
  previousAvatarUrl: string | null,
  requestUrl: string,
  nextAvatarPath: string
) {
  const previousAvatarPath = getLocalAvatarPath(previousAvatarUrl, requestUrl);
  if (!previousAvatarPath || previousAvatarPath === nextAvatarPath) return;

  try {
    await unlink(previousAvatarPath);
  } catch {
    // A stale or already-removed previous avatar should not block the new upload.
  }
}

function getLocalAvatarPath(value: string | null, requestUrl: string) {
  if (!value) return null;

  try {
    const requestOrigin = new URL(requestUrl).origin;
    const url = new URL(value, requestUrl);
    if (url.origin !== requestOrigin) return null;

    const uploadPathPrefix = "/uploads/profile-avatars/";
    if (!url.pathname.startsWith(uploadPathPrefix)) return null;

    const filename = decodeURIComponent(url.pathname.slice(uploadPathPrefix.length));
    if (!filename || filename.includes("/") || filename.includes("\\")) return null;

    const uploadRoot = path.resolve(AVATAR_UPLOAD_DIR);
    const avatarPath = path.resolve(uploadRoot, filename);
    if (!avatarPath.startsWith(`${uploadRoot}${path.sep}`)) return null;

    return avatarPath;
  } catch {
    return null;
  }
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
