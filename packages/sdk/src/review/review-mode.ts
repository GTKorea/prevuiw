import type { PrevuiwConfig, CommentData } from "./types";
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
let commentInput: HTMLDivElement | null = null;
let reviewerName = "Anonymous";

function askReviewerName(shadowRoot: ShadowRoot): Promise<string> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "prevuiw-name-overlay";

    const card = document.createElement("div");
    card.className = "prevuiw-name-card";

    const title = document.createElement("h2");
    title.textContent = "Join Review Session";

    const subtitle = document.createElement("p");
    subtitle.textContent = "Enter your name to start reviewing this page";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Your name";
    input.autofocus = true;

    const btn = document.createElement("button");
    btn.className = "btn-start";
    btn.textContent = "Start Review";

    function submit() {
      const name = input.value.trim() || "Anonymous";
      overlay.remove();
      resolve(name);
    }

    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(input);
    card.appendChild(btn);
    overlay.appendChild(card);
    shadowRoot.appendChild(overlay);

    setTimeout(() => input.focus(), 50);
  });
}

export async function initReviewMode(config: PrevuiwConfig) {
  const shadowRoot = createShadowHost();
  reviewerName = await askReviewerName(shadowRoot);
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
  toolbar = new Toolbar(shadowRoot, handleModeChange, handlePinsToggle, handleSidebarToggle);
  pinManager = new PinManager(shadowRoot);
  cursorLayer = new CursorLayer(shadowRoot);
  sidebar = new Sidebar(shadowRoot);

  // Load existing comments
  comments = await apiClient.getComments(versionId);
  pinManager.renderPins(comments);
  sidebar.updateComments(comments);

  // Reply handler (shared between pins and sidebar)
  const handleReply = async (commentId: string, content: string) => {
    if (!apiClient || !versionId) return;
    const reply = await apiClient.createReply(versionId, {
      content,
      parentId: commentId,
      guestName: reviewerName,
    });
    if (reply) {
      const parent = comments.find((c) => c.id === commentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(reply);
        pinManager?.renderPins(comments);
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
    pinManager?.renderPins(comments);
    sidebar?.updateComments(comments);
  };

  pinManager.setOnEmojiAdd(handleEmojiAdd);
  sidebar.setOnEmojiAdd(handleEmojiAdd);

  pinManager.setOnResolve(async (commentId) => {
    if (!apiClient || !versionId) return;
    const updated = await apiClient.resolveComment(versionId, commentId);
    if (updated) {
      const idx = comments.findIndex(c => c.id === commentId);
      if (idx >= 0) {
        comments[idx].isResolved = updated.isResolved;
        pinManager?.renderPins(comments);
        sidebar?.updateComments(comments);
      }
    }
  });
  sidebar.setOnReply(handleReply);
  sidebar.setOnResolve(async (commentId) => {
    if (!apiClient || !versionId) return;
    const updated = await apiClient.resolveComment(versionId, commentId);
    if (updated) {
      const idx = comments.findIndex(c => c.id === commentId);
      if (idx >= 0) {
        comments[idx].isResolved = updated.isResolved;
        pinManager?.renderPins(comments);
        sidebar?.updateComments(comments);
      }
    }
  });
  sidebar.setOnPinClick((commentId) => {
    // Scroll to pin position
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    const scrollWidth = document.documentElement.scrollWidth;
    const scrollHeight = document.documentElement.scrollHeight;
    const x = (comment.posX / 100) * scrollWidth;
    const y = (comment.posY / 100) * scrollHeight;
    window.scrollTo({ left: x - window.innerWidth / 2, top: y - 200, behavior: "smooth" });
  });

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
    sidebar?.updateComments(comments);
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

function handleSidebarToggle() {
  sidebar?.toggle();
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
      sidebar?.updateComments(comments);
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
