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
  const scriptTag = document.currentScript as HTMLScriptElement | null;
  const projectKey = scriptTag?.getAttribute("data-key");
  if (!projectKey) return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has("prevuiw")) return;

  // Mobile check
  if (window.innerWidth < 768) return;

  const apiUrl = scriptTag?.getAttribute("data-api") || "https://api.prevuiw.com";

  initReviewMode({ apiUrl, projectKey }).catch((err) => {
    console.error("[prevuiw] Review mode error:", err);
  });
})();
