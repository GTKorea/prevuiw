const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("prevuiw_token");
  }

  async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("prevuiw_token");
      }
      throw new Error(`API error: ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  get<T>(path: string) {
    return this.fetch<T>(path);
  }
  post<T>(path: string, body?: unknown) {
    return this.fetch<T>(path, { method: "POST", body: JSON.stringify(body) });
  }
  patch<T>(path: string, body?: unknown) {
    return this.fetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  }
  delete<T>(path: string) {
    return this.fetch<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
