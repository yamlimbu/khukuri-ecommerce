import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeAssetUrl(
  url: string | null | undefined,
  cacheBuster?: string | number | null
): string {
  const normalized = url ? url.replace(/\\/g, '/') : '';
  if (!normalized) {
    return '';
  }

  if (cacheBuster == null || cacheBuster === '') {
    return normalized;
  }

  const separator = normalized.includes('?') ? '&' : '?';
  return `${normalized}${separator}v=${encodeURIComponent(String(cacheBuster))}`;
}
