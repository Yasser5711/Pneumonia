// src/lib/apiFetch.ts
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    credentials: 'include', // ← cookies cross-site
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  })

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)

  // 204 → aucune réponse JSON
  return (res.status === 204 ? (undefined as T) : await res.json()) as T
}
