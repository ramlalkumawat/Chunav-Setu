"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { storageService } from "../storage";

// In-memory cache for resolved signed URLs to avoid redundant network requests
const urlCache = new Map<string, { url: string; expiresAt: number }>();

export function useStorageUrl(storagePathOrUrl?: string | null): {
  url: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const resolveUrl = useCallback(async (path?: string | null, forceRefresh = false) => {
    if (!path || path.trim() === "") {
      setUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const trimmed = path.trim();

    // 1. Direct Web URLs or Base64 / Blob data URLs or local public URLs
    if (
      trimmed.startsWith("/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("data:")
    ) {
      setUrl(trimmed);
      setIsLoading(false);
      setError(null);
      return;
    }

    // 2. Check in-memory cache
    const now = Date.now();
    const cached = urlCache.get(trimmed);
    if (!forceRefresh && cached && cached.expiresAt > now + 60000) {
      // Valid cache with > 60s lifetime
      setUrl(cached.url);
      setIsLoading(false);
      setError(null);
      return;
    }

    // 3. Resolve private Supabase Storage Signed URL
    setIsLoading(true);
    try {
      const res = await storageService.getSignedUrl(trimmed, 3600);
      if (!isMounted.current) return;

      if (res.success && res.signedUrl) {
        urlCache.set(trimmed, {
          url: res.signedUrl,
          expiresAt: now + (res.expiresIn || 3600) * 1000,
        });
        setUrl(res.signedUrl);
        setError(null);
      } else {
        // Fallback: If signed URL fails, keep path for error boundary
        setUrl(trimmed);
        setError(res.error || "Failed to resolve storage URL");
      }
    } catch (err: any) {
      if (isMounted.current) {
        setUrl(trimmed);
        setError(err.message || "Failed to resolve storage URL");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    resolveUrl(storagePathOrUrl);
    return () => {
      isMounted.current = false;
    };
  }, [storagePathOrUrl, resolveUrl]);

  const refresh = useCallback(() => {
    resolveUrl(storagePathOrUrl, true);
  }, [storagePathOrUrl, resolveUrl]);

  return { url, isLoading, error, refresh };
}
