const TOKEN_KEY = "prevuiw_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getGoogleAuthUrl(): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
}

export function getGithubAuthUrl(): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;
}
