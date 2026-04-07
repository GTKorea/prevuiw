import { startIframeTracker } from "./iframe-tracker";
import { initReviewMode } from "./review/review-mode";

(function prevuiwSdk() {
  if (typeof window === "undefined") return;

  // Branch 1: Inside iframe — existing scroll/URL tracking
  if (window !== window.top) {
    startIframeTracker();
    return;
  }

  // Branch 2: Top-level window — check for review mode activation
  let scriptTag = document.currentScript as HTMLScriptElement | null;
  // Fallback: if currentScript is null (e.g. deferred execution), find the script tag manually
  if (!scriptTag) {
    scriptTag = document.querySelector('script[data-key][src*="sdk"]') as HTMLScriptElement | null;
  }
  const projectKey = scriptTag?.getAttribute("data-key");
  if (!projectKey) return;

  const params = new URLSearchParams(window.location.search);
  const versionKey = params.get("prevuiw");
  if (!versionKey) return;

  const inviteToken = params.get("token");
  if (!inviteToken) return;

  // Intercept same-origin links to preserve ?prevuiw and ?token query params
  document.addEventListener("click", (e: MouseEvent) => {
    const path = e.composedPath();
    let anchor: HTMLAnchorElement | null = null;
    for (const el of path) {
      if (el instanceof HTMLAnchorElement) {
        anchor = el;
        break;
      }
    }
    if (!anchor || !anchor.href) return;
    if (anchor.closest("#prevuiw-root")) return;

    try {
      const targetUrl = new URL(anchor.href, window.location.href);
      if (targetUrl.origin !== window.location.origin) return;
      if (targetUrl.searchParams.has("prevuiw")) return;
      if (targetUrl.pathname === window.location.pathname && targetUrl.hash) return;

      e.preventDefault();
      targetUrl.searchParams.set("prevuiw", versionKey);
      targetUrl.searchParams.set("token", inviteToken);
      window.location.href = targetUrl.toString();
    } catch {
      // Invalid URL
    }
  }, true);

  // Mobile check
  if (window.innerWidth < 768) return;

  const apiUrl = scriptTag?.getAttribute("data-api") || "https://api.prevuiw.com";

  initReviewMode({ apiUrl, projectKey, versionKey, inviteToken }).catch((err) => {
    console.error("[prevuiw] Review mode error:", err);
  });
})();
