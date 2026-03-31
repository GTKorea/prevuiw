import type { PrevuiwConfig, CommentData } from "./types";
import { createShadowHost, destroyShadowHost } from "./shadow-host";
import { Toolbar, ToolbarMode } from "./toolbar";
import { PinManager } from "./pin-manager";
import { CursorLayer } from "./cursor-layer";
import { startPicker, stopPicker } from "./element-picker";
import { ApiClient } from "./api-client";
import { WsClient } from "./ws-client";

let toolbar: Toolbar | null = null;
let pinManager: PinManager | null = null;
let cursorLayer: CursorLayer | null = null;
let apiClient: ApiClient | null = null;
let wsClient: WsClient | null = null;
let comments: CommentData[] = [];
let versionId: string | null = null;
let commentInput: HTMLDivElement | null = null;
let reviewerName = "Anonymous";

export async function initReviewMode(config: PrevuiwConfig) {
  reviewerName = prompt("Enter your name for this review session:") || "Anonymous";

  const shadowRoot = createShadowHost();
  apiClient = new ApiClient(config.apiUrl, config.projectKey);

  // Resolve version
  const resolved = await apiClient.resolveVersion(window.location.href);
  if (!resolved) {
    console.error("[prevuiw] Could not resolve version. Is the project key valid?");
    destroyShadowHost();
    return;
  }
  versionId = resolved.versionId;

  // Create UI components
  toolbar = new Toolbar(shadowRoot, handleModeChange, handlePinsToggle, handleExpandToggle);
  pinManager = new PinManager(shadowRoot);
  cursorLayer = new CursorLayer(shadowRoot);

  // Load existing comments
  comments = await apiClient.getComments(versionId);
  pinManager.renderPins(comments);

  // Connect WebSocket
  wsClient = new WsClient(config.apiUrl, config.projectKey, versionId, reviewerName);

  wsClient.on("_connected", () => {
    toolbar?.setStatus(reviewerName);
  });

  wsClient.on("_disconnected", () => {
    toolbar?.setStatus("Offline");
    cursorLayer?.setVisible(false);
  });

  wsClient.on("cursor:move", (data: any) => {
    cursorLayer?.updateCursor(data);
  });

  wsClient.on("cursor:join", (data: any) => {
    toolbar?.setStatus(`${reviewerName} +${data.name}`);
  });

  wsClient.on("cursor:leave", (data: any) => {
    cursorLayer?.removeCursor(data.socketId);
  });

  wsClient.on("cursor:presence", (users: any[]) => {
    if (users.length > 0) {
      toolbar?.setStatus(`${reviewerName} +${users.length}`);
    }
  });

  wsClient.on("newComment", (comment: CommentData) => {
    comments.push(comment);
    pinManager?.renderPins(comments);
  });

  await wsClient.connect();

  // Track cursor movement
  document.addEventListener("mousemove", handleGlobalMouseMove);

  // Update pin positions on scroll
  window.addEventListener("scroll", handleScroll, { passive: true });

  toolbar.setStatus(reviewerName);
}

function handlePinsToggle(visible: boolean) {
  pinManager?.setVisible(visible);
}

function handleExpandToggle(expanded: boolean) {
  pinManager?.setAllExpanded(expanded, comments);
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
  commentInput.style.left = `${pixelX + 20}px`;
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
    const comment = await apiClient.createComment(versionId, {
      content,
      posX: data.posX,
      posY: data.posY,
      cssSelector: data.selector || null,
      pageUrl: data.pageUrl,
      guestName: reviewerName,
    });

    if (comment) {
      comments.push(comment);
      pinManager?.renderPins(comments);
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
    pinManager?.updateAllPositions(comments);
  });
}

function handleGlobalMouseMove(e: MouseEvent) {
  if (!wsClient) return;
  const scrollWidth = document.documentElement.scrollWidth;
  const scrollHeight = document.documentElement.scrollHeight;
  const x = ((e.clientX + window.scrollX) / scrollWidth) * 100;
  const y = ((e.clientY + window.scrollY) / scrollHeight) * 100;
  wsClient.sendCursorMove(x, y);
}
