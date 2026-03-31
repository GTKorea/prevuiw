export function startIframeTracker() {
  let active = false;
  let scrollRafId = 0;

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
