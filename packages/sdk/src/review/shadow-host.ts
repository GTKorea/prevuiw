import { SDK_STYLES } from "./styles";

let shadowRoot: ShadowRoot | null = null;
let hostElement: HTMLDivElement | null = null;

export function createShadowHost(): ShadowRoot {
  if (shadowRoot) return shadowRoot;

  hostElement = document.createElement("div");
  hostElement.id = "prevuiw-root";
  document.body.appendChild(hostElement);

  shadowRoot = hostElement.attachShadow({ mode: "open" });

  // Use adoptedStyleSheets for CSP compatibility
  if ("adoptedStyleSheets" in Document.prototype) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(SDK_STYLES);
    shadowRoot.adoptedStyleSheets = [sheet];
  } else {
    // Fallback for older browsers — may be blocked by strict CSP
    const style = document.createElement("style");
    style.textContent = SDK_STYLES;
    shadowRoot.appendChild(style);
  }

  // Keep host height synced with document height
  updateHostHeight();
  window.addEventListener("scroll", updateHostHeight, { passive: true });
  window.addEventListener("resize", updateHostHeight, { passive: true });

  return shadowRoot;
}

function updateHostHeight() {
  if (hostElement) {
    hostElement.style.setProperty("--prevuiw-doc-height", document.documentElement.scrollHeight + "px");
  }
}

export function getShadowRoot(): ShadowRoot | null {
  return shadowRoot;
}

export function destroyShadowHost() {
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
    shadowRoot = null;
  }
}
