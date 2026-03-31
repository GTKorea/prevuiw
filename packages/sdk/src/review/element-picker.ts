import { getCssSelector } from "css-selector-generator";

let highlightEl: HTMLDivElement | null = null;
let active = false;
let onPick: ((data: { selector: string; posX: number; posY: number; pageUrl: string }) => void) | null = null;

export function startPicker(
  shadowRoot: ShadowRoot,
  callback: (data: { selector: string; posX: number; posY: number; pageUrl: string }) => void
) {
  active = true;
  onPick = callback;

  if (!highlightEl) {
    highlightEl = document.createElement("div");
    highlightEl.className = "prevuiw-highlight";
    shadowRoot.appendChild(highlightEl);
  }
  highlightEl.style.display = "none";

  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("click", handleClick, true);
}

export function stopPicker() {
  active = false;
  onPick = null;
  document.removeEventListener("mousemove", handleMouseMove, true);
  document.removeEventListener("click", handleClick, true);
  if (highlightEl) {
    highlightEl.style.display = "none";
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!active || !highlightEl) return;

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target || target.id === "prevuiw-root") {
    highlightEl.style.display = "none";
    return;
  }

  const rect = target.getBoundingClientRect();
  highlightEl.style.display = "block";
  highlightEl.style.left = `${rect.left}px`;
  highlightEl.style.top = `${rect.top}px`;
  highlightEl.style.width = `${rect.width}px`;
  highlightEl.style.height = `${rect.height}px`;
}

function handleClick(e: MouseEvent) {
  if (!active || !onPick) return;

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target || target.id === "prevuiw-root") return;

  e.preventDefault();
  e.stopPropagation();

  let selector: string;
  try {
    selector = getCssSelector(target, {
      selectors: ["id", "class", "tag", "nthchild"],
      includeTag: true,
    });
  } catch {
    selector = "";
  }

  const scrollWidth = document.documentElement.scrollWidth;
  const scrollHeight = document.documentElement.scrollHeight;
  const docX = ((e.clientX + window.scrollX) / scrollWidth) * 100;
  const docY = ((e.clientY + window.scrollY) / scrollHeight) * 100;

  onPick({
    selector,
    posX: docX,
    posY: docY,
    pageUrl: window.location.href,
  });
}
