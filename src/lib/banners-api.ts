import "server-only";

import { getDataApiUrl } from "@/lib/backend-api-urls";
import type { HomepageBanner } from "@/types/banner";

type RawBannersResponse = {
  success?: boolean;
  data?: unknown;
};

type RawBanner = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  image_url?: unknown;
  imageUrl?: unknown;
  link_url?: unknown;
  linkUrl?: unknown;
  sort?: unknown;
};

export async function getHomepageBanners(): Promise<HomepageBanner[]> {
  try {
    const response = await fetch(getDataApiUrl("/banners"), {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as RawBannersResponse;
    if (!Array.isArray(payload.data)) {
      return [];
    }

    return payload.data
      .map(normalizeBanner)
      .filter((banner): banner is HomepageBanner => Boolean(banner))
      .sort((left, right) => left.sort - right.sort);
  } catch {
    return [];
  }
}

function normalizeBanner(rawValue: unknown): HomepageBanner | null {
  if (!isRecord(rawValue)) return null;
  const raw = rawValue as RawBanner;
  const id = toNumber(raw.id);
  const title = toString(raw.title);
  const description = toString(raw.description);
  const imageUrl = toString(raw.image_url) ?? toString(raw.imageUrl);
  const linkUrl = toString(raw.link_url) ?? toString(raw.linkUrl);

  if (id === null || !title || !description || !imageUrl || !linkUrl) {
    return null;
  }

  return {
    id,
    title,
    description,
    imageUrl,
    linkUrl,
    sort: toNumber(raw.sort) ?? 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
