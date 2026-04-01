export function startIframeTracker() {
  let active = false;
  let scrollRafId = 0;
  let pickerActive = false;
  let highlightEl: HTMLDivElement | null = null;

  function sendUrl() {
    if (!active) return;
    window.parent.postMessage({ type: "prevuiw:url", url: location.href }, "*");
  }

  function sendScroll() {
    if (!active) return;
    window.parent.postMessage({
      type: "prevuiw:scroll",
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
    }, "*");
  }

  function onScroll() {
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = 0;
      sendScroll();
    });
  }

  // --- Element picker for iframe mode ---
  function generateSelector(el: Element): string {
    // Try data-testid first
    const testId = el.getAttribute("data-testid") || el.getAttribute("data-cy");
    if (testId) return `[data-testid="${testId}"]`;

    // Try id
    if (el.id && document.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1) {
      return `#${CSS.escape(el.id)}`;
    }

    // Build path with tag + nth-child
    const parts: string[] = [];
    let current: Element | null = el;
    while (current && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current!.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }
      parts.unshift(selector);
      current = parent;
      if (parts.length > 5) break;
    }
    return parts.join(" > ");
  }

  function onPickerMouseMove(e: MouseEvent) {
    if (!pickerActive) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === highlightEl) {
      if (highlightEl) highlightEl.style.display = "none";
      return;
    }
    if (!highlightEl) {
      highlightEl = document.createElement("div");
      highlightEl.style.cssText = "position:fixed;pointer-events:none;border:2px solid #3b82f6;border-radius:4px;background:rgba(59,130,246,0.08);z-index:2147483647;transition:all 0.05s;";
      document.body.appendChild(highlightEl);
    }
    const rect = target.getBoundingClientRect();
    highlightEl.style.display = "block";
    highlightEl.style.left = rect.left + "px";
    highlightEl.style.top = rect.top + "px";
    highlightEl.style.width = rect.width + "px";
    highlightEl.style.height = rect.height + "px";
  }

  function onPickerClick(e: MouseEvent) {
    if (!pickerActive) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === highlightEl) return;

    e.preventDefault();
    e.stopPropagation();

    const selector = generateSelector(target);
    const scrollWidth = document.documentElement.scrollWidth;
    const scrollHeight = document.documentElement.scrollHeight;
    const docX = ((e.clientX + window.scrollX) / scrollWidth) * 100;
    const docY = ((e.clientY + window.scrollY) / scrollHeight) * 100;

    // Send viewport-relative % for the overlay positioning
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    const viewX = (e.clientX / clientWidth) * 100;
    const viewY = (e.clientY / clientHeight) * 100;

    window.parent.postMessage({
      type: "prevuiw:elementPicked",
      selector,
      posX: docX,
      posY: docY,
      viewX,
      viewY,
      pageUrl: location.href,
    }, "*");

    stopPicker();
  }

  function startPicker() {
    pickerActive = true;
    document.addEventListener("mousemove", onPickerMouseMove, true);
    document.addEventListener("click", onPickerClick, true);
    document.body.style.cursor = "crosshair";
  }

  function stopPicker() {
    pickerActive = false;
    document.removeEventListener("mousemove", onPickerMouseMove, true);
    document.removeEventListener("click", onPickerClick, true);
    document.body.style.cursor = "";
    if (highlightEl) {
      highlightEl.style.display = "none";
    }
  }

  function start() {
    active = true;
    sendUrl();
    sendScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("hashchange", sendUrl);

    const origPushState = history.pushState;
    const origReplaceState = history.replaceState;
    history.pushState = function (...args: any[]) {
      origPushState.apply(this, args);
      sendUrl();
      sendScroll();
    };
    history.replaceState = function (...args: any[]) {
      origReplaceState.apply(this, args);
      sendUrl();
      sendScroll();
    };

    if (document.readyState === "complete") {
      sendScroll();
    } else {
      window.addEventListener("load", () => sendScroll());
    }

    let lastW = 0, lastH = 0;
    const pollInterval = setInterval(() => {
      const w = document.documentElement.scrollWidth;
      const h = document.documentElement.scrollHeight;
      if (w !== lastW || h !== lastH) { lastW = w; lastH = h; sendScroll(); }
    }, 300);
    setTimeout(() => clearInterval(pollInterval), 10000);

    // Listen for picker commands from parent
    window.addEventListener("message", (e) => {
      if (e.data?.type === "prevuiw:startPicker") startPicker();
      if (e.data?.type === "prevuiw:stopPicker") stopPicker();
    });
  }

  function onMessage(e: MessageEvent) {
    if (e.data?.type === "prevuiw:pong") {
      window.removeEventListener("message", onMessage);
      start();
    }
  }

  window.addEventListener("message", onMessage);
  window.parent.postMessage({ type: "prevuiw:ping" }, "*");
  setTimeout(() => window.removeEventListener("message", onMessage), 3000);
}
