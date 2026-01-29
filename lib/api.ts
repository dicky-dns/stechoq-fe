import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api";

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

function buildErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
  if (!payload) return fallback;
  if (payload.message) return payload.message;
  if (payload.errors) {
    const firstKey = Object.keys(payload.errors)[0];
    const firstMessage = payload.errors[firstKey]?.[0];
    if (firstMessage) return firstMessage;
  }
  return fallback;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }
    throw new Error(buildErrorMessage(payload, "Request failed"));
  }

  return (await response.json()) as T;
}
