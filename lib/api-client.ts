"use client";
import useSWR, { type KeyedMutator } from "swr";

const TOKEN_KEY = "memoryos_token";

export async function ensureToken(): Promise<string> {
  if (typeof window === "undefined") return "demo-token";
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    try {
      const r = await fetch("/api/v1/auth/anon", { method: "POST" });
      const j = await r.json();
      t = (j?.data?.token as string) ?? "demo-token";
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      t = "demo-token";
    }
  }
  if (!t) t = "demo-token";
  return t;
}

export async function api<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await ensureToken();
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  const j = await res.json();
  return j.data as T;
}

export function fetcher<T>(path: string): Promise<T> {
  return api<T>(path);
}

export function useApi<T>(path: string): {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  mutate: KeyedMutator<T>;
} {
  const { data, error, isLoading, mutate } = useSWR<T>(path, (p: string) =>
    fetcher<T>(p),
    { refreshInterval: 5000 },
  );
  return {
    data,
    error: error as Error | null,
    isLoading,
    mutate: mutate as KeyedMutator<T>,
  };
}
