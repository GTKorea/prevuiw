import type { PrevuiwConfig, CommentData, Viewport } from "./types";
import { createShadowHost, destroyShadowHost } from "./shadow-host";
import { Toolbar, ToolbarMode } from "./toolbar";
import { PinManager } from "./pin-manager";
import { CursorLayer } from "./cursor-layer";
import { Sidebar } from "./sidebar";
import { startPicker, stopPicker } from "./element-picker";
import { ApiClient } from "./api-client";
import { WsClient } from "./ws-client";

let toolbar: Toolbar | null = null;
let pinManager: PinManager | null = null;
let cursorLayer: CursorLayer | null = null;
let sidebar: Sidebar | null = null;
let apiClient: ApiClient | null = null;
let wsClient: WsClient | null = null;
let comments: CommentData[] = [];
let versionId: string | null = null;
let versionKey: string | null = null;
let commentInput: HTMLDivElement | null = null;
let reviewerName = "Anonymous";
let currentViewport: Viewport = "DESKTOP_1920";
let screenshotTaken = new Set<string>();

const NAME_KEY = "prevuiw_reviewer_name";
const TOKEN_KEY = "prevuiw_auth_token";
const VIEWPORT_KEY = "prevuiw_viewport";

// ─── Helpers ───

function getPageUrl(): string {
  // Normalize: strip prevuiw/token query params for consistent page matching
  const url = new URL(window.location.href);
  url.searchParams.delete("prevuiw");
  url.searchParams.delete("token");
  return url.toString();
}

function getSaved(): { name: string; token?: string } | null {
  try {
    const name = localStorage.getItem(NAME_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (name) return { name, token: token || undefined };
    return null;
  } catch { return null; }
}

function saveAuth(name: string, token?: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

function getSavedViewport(): Viewport {
  try {
    const v = localStorage.getItem(VIEWPORT_KEY);
    if (v === "MOBILE_375" || v === "TABLET_768" || v === "LAPTOP_1440" || v === "DESKTOP_1920") return v;
  } catch {}
  return "DESKTOP_1920";
}

function saveViewport(v: Viewport) {
  try { localStorage.setItem(VIEWPORT_KEY, v); } catch {}
}

let authToken: string | undefined;

// ─── Name Dialog ───

function askReviewerName(shadowRoot: ShadowRoot, apiUrl: string): Promise<string> {
  const saved = getSaved();
  if (saved) {
    authToken = saved.token;
    return Promise.resolve(saved.name);
  }

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "prevuiw-name-overlay";

    const card = document.createElement("div");
    card.className = "prevuiw-name-card";

    const title = document.createElement("h2");
    title.textContent = "Join Review Session";

    const subtitle = document.createElement("p");
    subtitle.textContent = "Enter your name or sign in with Google";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Your name";
    input.autofocus = true;

    const btn = document.createElement("button");
    btn.className = "btn-start";
    btn.textContent = "Start Review";

    const divider = document.createElement("div");
    divider.className = "prevuiw-name-divider";
    divider.textContent = "or";

    const googleBtn = document.createElement("button");
    googleBtn.className = "btn-google";
    googleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
    Sign in with Google`;

    function submit() {
      const name = input.value.trim() || "Anonymous";
      saveAuth(name);
      overlay.remove();
      resolve(name);
    }

    function openGoogleAuth() {
      window.open(`${apiUrl}/auth/google/sdk`, "prevuiw-auth", "width=500,height=600,left=200,top=100");
      function onMessage(e: MessageEvent) {
        if (e.data?.type !== "prevuiw:auth") return;
        window.removeEventListener("message", onMessage);
        const { token, user } = e.data;
        authToken = token;
        const name = user?.name || "User";
        saveAuth(name, token);
        overlay.remove();
        resolve(name);
      }
      window.addEventListener("message", onMessage);
    }

    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    googleBtn.addEventListener("click", openGoogleAuth);

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(input);
    card.appendChild(btn);
    card.appendChild(divider);
    card.appendChild(googleBtn);
    overlay.appendChild(card);
    shadowRoot.appendChild(overlay);

    setTimeout(() => input.focus(), 50);
  });
}

// ─── Init ───

export async function initReviewMode(config: PrevuiwConfig) {
  const shadowRoot = createShadowHost();
  reviewerName = await askReviewerName(shadowRoot, config.apiUrl);
  apiClient = new ApiClient(config.apiUrl, config.projectKey, config.inviteToken, authToken);
  versionKey = config.versionKey;

  const resolved = await apiClient.resolveVersion(config.versionKey);
  if (!resolved) {
    console.error("[prevuiw] Could not resolve version. Invalid key or token.");
    destroyShadowHost();
    return;
  }
  versionId = resolved.versionId;

  // Restore saved viewport
  currentViewport = getSavedViewport();

  // Add body transition for smooth sidebar open/close
  document.body.style.transition = "margin-right 0.2s ease";

  toolbar = new Toolbar(
    shadowRoot,
    handleModeChange,
    handlePinsToggle,
    handleSidebarToggle,
    handleViewportChange,
    reviewerName,
    currentViewport,
  );
  pinManager = new PinManager(shadowRoot);
  cursorLayer = new CursorLayer(shadowRoot);
  sidebar = new Sidebar(shadowRoot);

  // Apply saved viewport width
  applyViewportWidth(currentViewport);

  // Load comments for current page + viewport
  await loadComments();

  // Reply handler
  const handleReply = async (commentId: string, content: string) => {
    if (!apiClient || !versionId) return;
    const reply = await apiClient.createReply(versionId, {
      content,
      parentId: commentId,
      reviewerName,
      viewport: currentViewport,
    });
    if (reply) {
      const parent = comments.find((c) => c.id === commentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(reply);
        pinManager?.renderPins(getPageComments());
        sidebar?.updateComments(comments);
      }
    }
  };

  pinManager.setOnReply(handleReply);

  const handleEmojiAdd = (commentId: string, emoji: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    if (!comment.reactions) comment.reactions = [];
    comment.reactions.push({ emoji, userId: "guest" });
    pinManager?.renderPins(getPageComments());
    sidebar?.updateComments(comments);
  };

  pinManager.setOnEmojiAdd(handleEmojiAdd);
  sidebar.setOnEmojiAdd(handleEmojiAdd);

  const handleResolve = async (commentId: string) => {
    if (!apiClient || !versionId) return;
    const updated = await apiClient.resolveComment(versionId, commentId);
    if (updated) {
      const idx = comments.findIndex(c => c.id === commentId);
      if (idx >= 0) {
        comments[idx].isResolved = updated.isResolved;
        pinManager?.renderPins(getPageComments());
        sidebar?.updateComments(comments);
      }
    }
  };

  pinManager.setOnResolve(handleResolve);
  sidebar.setOnReply(handleReply);
  sidebar.setOnResolve(handleResolve);

  // Sidebar pin click → navigate to comment's page if different, then scroll
  sidebar.setOnPinClick((commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const currentPage = getPageUrl();
    if (comment.pageUrl && comment.pageUrl !== currentPage) {
      // Navigate to the comment's page, preserving prevuiw params
      const targetUrl = new URL(comment.pageUrl);
      const params = new URLSearchParams(window.location.search);
      const pv = params.get("prevuiw");
      const tk = params.get("token");
      if (pv) targetUrl.searchParams.set("prevuiw", pv);
      if (tk) targetUrl.searchParams.set("token", tk);
      window.location.href = targetUrl.toString();
      return;
    }

    const scrollWidth = document.documentElement.scrollWidth;
    const scrollHeight = document.documentElement.scrollHeight;
    const x = (comment.posX / 100) * scrollWidth;
    const y = (comment.posY / 100) * scrollHeight;
    window.scrollTo({ left: x - window.innerWidth / 2, top: y - 200, behavior: "smooth" });
  });

  // WebSocket
  wsClient = new WsClient(config.apiUrl, config.projectKey, versionId, reviewerName, config.versionKey, config.inviteToken);
  wsClient.on("_connected", () => {});
  wsClient.on("_disconnected", () => { cursorLayer?.setVisible(false); });
  wsClient.on("cursor:move", (data: any) => { cursorLayer?.updateCursor(data); });
  wsClient.on("cursor:join", () => {});
  wsClient.on("cursor:leave", (data: any) => { cursorLayer?.removeCursor(data.socketId); });
  wsClient.on("cursor:presence", () => {});

  wsClient.on("newComment", (comment: CommentData) => {
    if (comment.viewport === currentViewport) {
      comments.push(comment);
      pinManager?.setAllComments(comments);
      pinManager?.renderPins(getPageComments());
      sidebar?.updateComments(comments);
      toolbar?.setCommentCount(comments.filter(c => !c.parentId).length);
    }
  });

  await wsClient.connect();

  document.addEventListener("mousemove", handleGlobalMouseMove);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("scroll", handleScroll, { passive: true });
}

// ─── Comments ───

function getPageComments(): CommentData[] {
  const page = getPageUrl();
  return comments.filter(c => !c.parentId && c.pageUrl === page);
}

async function loadComments() {
  if (!apiClient || !versionId) return;
  comments = await apiClient.getComments(versionId, currentViewport);
  pinManager?.setAllComments(comments);
  pinManager?.renderPins(getPageComments());
  sidebar?.updateComments(comments);
  toolbar?.setCommentCount(comments.filter(c => !c.parentId).length);
}

// ─── Handlers ───

function handlePinsToggle(visible: boolean) {
  pinManager?.setVisible(visible);
}

function handleSidebarToggle() {
  sidebar?.toggle();
}

const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  MOBILE_375: 375,
  TABLET_768: 768,
  LAPTOP_1440: 1440,
  DESKTOP_1920: 0,
};

function applyViewportWidth(viewport: Viewport) {
  const width = VIEWPORT_WIDTHS[viewport];
  if (width > 0) {
    document.documentElement.style.maxWidth = `${width}px`;
    document.documentElement.style.margin = "0 auto";
  } else {
    document.documentElement.style.maxWidth = "";
    document.documentElement.style.margin = "";
  }
}

async function handleViewportChange(viewport: Viewport) {
  currentViewport = viewport;
  saveViewport(viewport);
  applyViewportWidth(viewport);
  await loadComments();
}

function handleModeChange(mode: ToolbarMode) {
  if (mode === "annotate") {
    const shadowRoot = createShadowHost();
    startPicker(shadowRoot, handleElementPicked);
  } else {
    stopPicker();
    closeCommentInput();
  }
}

function handleKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

  // V → Browse mode
  if ((e.key === "v" || e.key === "V") && !e.metaKey && !e.ctrlKey && !e.altKey) {
    toolbar?.setMode("browse");
    return;
  }

  // C → Comment mode (plain C key, not Cmd+C)
  if ((e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey && !e.altKey) {
    toolbar?.setMode("annotate");
    return;
  }
}

function handleElementPicked(data: { selector: string; posX: number; posY: number; pageUrl: string }) {
  stopPicker();
  showCommentInput(data);
}

function showCommentInput(data: { selector: string; posX: number; posY: number; pageUrl: string }) {
  const shadowRoot = createShadowHost();
  closeCommentInput();

  commentInput = document.createElement("div");
  commentInput.className = "prevuiw-comment-input";

  const scrollWidth = document.documentElement.scrollWidth;
  const scrollHeight = document.documentElement.scrollHeight;
  const pixelX = (data.posX / 100) * scrollWidth;
  const pixelY = (data.posY / 100) * scrollHeight;

  const inputWidth = 280;
  const margin = 20;
  if (pixelX + margin + inputWidth > window.innerWidth + window.scrollX) {
    commentInput.style.left = `${pixelX - inputWidth - 10}px`;
  } else {
    commentInput.style.left = `${pixelX + margin}px`;
  }
  commentInput.style.top = `${pixelY}px`;

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Add a comment...";

  const actions = document.createElement("div");
  actions.className = "actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => {
    closeCommentInput();
    toolbar?.setMode("browse");
  });

  const submitBtn = document.createElement("button");
  submitBtn.className = "btn-submit";
  submitBtn.textContent = "Submit";
  submitBtn.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (!content || !apiClient || !versionId) return;

    submitBtn.textContent = "...";

    const pageUrl = getPageUrl();
    const screenshotKey = `${currentViewport}:${pageUrl}`;
    if (!screenshotTaken.has(screenshotKey) && versionKey) {
      screenshotTaken.add(screenshotKey);
      captureAndUploadScreenshot(pageUrl);
    }

    const comment = await apiClient.createComment(versionId, {
      content,
      posX: data.posX,
      posY: data.posY,
      viewport: currentViewport,
      cssSelector: data.selector || null,
      pageUrl,
      reviewerName,
    });

    if (comment) {
      comments.push(comment);
      pinManager?.setAllComments(comments);
      pinManager?.renderPins(getPageComments());
      sidebar?.updateComments(comments);
      toolbar?.setCommentCount(comments.filter(c => !c.parentId).length);
    }

    closeCommentInput();
    toolbar?.setMode("browse");
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  commentInput.appendChild(textarea);
  commentInput.appendChild(actions);
  shadowRoot.appendChild(commentInput);

  setTimeout(() => textarea.focus(), 50);
}

async function captureAndUploadScreenshot(pageUrl: string) {
  if (!apiClient || !versionKey) return;
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      logging: false,
      scale: 1,
      ignoreElements: (el: Element) => el.id === "prevuiw-root",
    });
    canvas.toBlob(async (blob) => {
      if (blob && apiClient && versionKey) {
        const ok = await apiClient.uploadScreenshot(versionKey, currentViewport, pageUrl, blob);
        if (!ok) console.warn("[prevuiw] Screenshot upload returned false");
      }
    }, "image/png");
  } catch (err) {
    console.error("[prevuiw] Screenshot capture failed:", err);
  }
}

function closeCommentInput() {
  if (commentInput) {
    commentInput.remove();
    commentInput = null;
  }
}

let scrollRafId = 0;
function handleScroll() {
  if (scrollRafId) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = 0;
    pinManager?.updateAllPositions(getPageComments());
  });
}

export function destroyReviewMode() {
  document.removeEventListener("mousemove", handleGlobalMouseMove);
  document.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("scroll", handleScroll);
  document.body.style.transition = "";
  document.body.style.marginRight = "";
  if (scrollRafId) cancelAnimationFrame(scrollRafId);
  toolbar?.destroy();
  pinManager?.destroy();
  cursorLayer?.destroy();
  sidebar?.destroy();
  wsClient?.disconnect();
  closeCommentInput();
  toolbar = null;
  pinManager = null;
  cursorLayer = null;
  sidebar = null;
  apiClient = null;
  wsClient = null;
  comments = [];
  versionId = null;
  versionKey = null;
}

function handleGlobalMouseMove(e: MouseEvent) {
  if (!wsClient) return;
  const scrollWidth = document.documentElement.scrollWidth;
  const scrollHeight = document.documentElement.scrollHeight;
  const x = ((e.clientX + window.scrollX) / scrollWidth) * 100;
  const y = ((e.clientY + window.scrollY) / scrollHeight) * 100;
  wsClient.sendCursorMove(x, y);
}
