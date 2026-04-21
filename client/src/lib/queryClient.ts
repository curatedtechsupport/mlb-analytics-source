import { QueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = Array.isArray(queryKey) ? queryKey.join("") : (queryKey as string);
        const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
        const res = await fetch(fullUrl);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${res.status}: ${text}`);
        }
        return res.json();
      },
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export { API_BASE };
