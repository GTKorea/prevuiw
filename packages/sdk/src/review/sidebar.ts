import type { CommentData } from "./types";

const MIN_WIDTH = 240;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 300;

export class Sidebar {
  private el: HTMLDivElement;
  private resizeHandle: HTMLDivElement;
  private listEl: HTMLDivElement;
  private countEl: HTMLSpanElement;
  private filterBtns: HTMLButtonElement[] = [];
  private filter: "all" | "open" | "resolved" = "all";
  private comments: CommentData[] = [];
  private isOpen = true;
  private width = DEFAULT_WIDTH;
  private onPinClick: ((commentId: string) => void) | null = null;
  private onReply: ((commentId: string, content: string) => Promise<void>) | null = null;
  private onResolve: ((commentId: string) => void) | null = null;
  private onEmojiAdd: ((commentId: string, emoji: string) => void) | null = null;

  constructor(private shadowRoot: ShadowRoot) {
    this.el = document.createElement("div");
    this.el.className = "prevuiw-sidebar open";
    this.el.style.width = `${this.width}px`;

    // Drag resize handle
    this.resizeHandle = document.createElement("div");
    this.resizeHandle.className = "prevuiw-sidebar-resize";
    this.setupResize();

    // Header
    const header = document.createElement("div");
    header.className = "prevuiw-sidebar-header";

    const titleWrap = document.createElement("div");
    titleWrap.className = "prevuiw-sidebar-title-wrap";
    const title = document.createElement("h2");
    title.className = "prevuiw-sidebar-title";
    title.textContent = "Comments";
    this.countEl = document.createElement("span");
    this.countEl.className = "prevuiw-sidebar-count";
    this.countEl.textContent = "(0)";
    titleWrap.appendChild(title);
    titleWrap.appendChild(this.countEl);

    const closeBtn = document.createElement("button");
    closeBtn.className = "prevuiw-sidebar-close";
    closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
    closeBtn.addEventListener("click", () => this.toggle(false));

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);

    // Filter tabs
    const tabs = document.createElement("div");
    tabs.className = "prevuiw-sidebar-tabs";

    for (const { key, label } of [
      { key: "all" as const, label: "All" },
      { key: "open" as const, label: "Open" },
      { key: "resolved" as const, label: "Resolved" },
    ]) {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = key === "all" ? "active" : "";
      btn.addEventListener("click", () => this.setFilter(key));
      tabs.appendChild(btn);
      this.filterBtns.push(btn);
    }

    // List
    this.listEl = document.createElement("div");
    this.listEl.className = "prevuiw-sidebar-list";

    this.el.appendChild(this.resizeHandle);
    this.el.appendChild(header);
    this.el.appendChild(tabs);
    this.el.appendChild(this.listEl);
    shadowRoot.appendChild(this.el);

    // Push body content on init
    this.applyBodyMargin();
  }

  private setupResize() {
    let startX = 0;
    let startWidth = 0;

    const onMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
      this.width = newWidth;
      this.el.style.width = `${newWidth}px`;
      this.applyBodyMargin();
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    this.resizeHandle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startX = e.clientX;
      startWidth = this.width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  private applyBodyMargin() {
    document.body.style.marginRight = this.isOpen ? `${this.width}px` : "";
  }

  setOnPinClick(cb: (commentId: string) => void) { this.onPinClick = cb; }
  setOnReply(cb: (commentId: string, content: string) => Promise<void>) { this.onReply = cb; }
  setOnResolve(cb: (commentId: string) => void) { this.onResolve = cb; }
  setOnEmojiAdd(cb: (commentId: string, emoji: string) => void) { this.onEmojiAdd = cb; }

  toggle(open?: boolean) {
    this.isOpen = open ?? !this.isOpen;
    this.el.classList.toggle("open", this.isOpen);
    this.applyBodyMargin();
    if (this.isOpen) this.renderList();
  }

  isVisible() { return this.isOpen; }

  updateComments(comments: CommentData[]) {
    this.comments = comments;
    const topCount = comments.filter(c => !c.parentId).length;
    this.countEl.textContent = `(${topCount})`;
    if (this.isOpen) this.renderList();
  }

  private setFilter(f: "all" | "open" | "resolved") {
    this.filter = f;
    this.filterBtns.forEach((btn, i) => {
      const keys = ["all", "open", "resolved"];
      btn.className = keys[i] === f ? "active" : "";
    });
    this.renderList();
  }

  private renderList() {
    this.listEl.innerHTML = "";
    const topLevel = this.comments.filter(c => !c.parentId);
    const filtered = topLevel.filter(c => {
      if (this.filter === "open") return !c.isResolved;
      if (this.filter === "resolved") return c.isResolved;
      return true;
    });

    // Update filter tab counts
    const openCount = topLevel.filter(c => !c.isResolved).length;
    const resolvedCount = topLevel.filter(c => c.isResolved).length;
    this.filterBtns[0].textContent = `All (${topLevel.length})`;
    this.filterBtns[1].textContent = `Open (${openCount})`;
    this.filterBtns[2].textContent = `Resolved (${resolvedCount})`;

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "prevuiw-sidebar-empty";
      empty.textContent = "No comments yet";
      this.listEl.appendChild(empty);
      return;
    }

    filtered.forEach((comment) => {
      const item = document.createElement("div");
      item.className = "prevuiw-sidebar-item";
      item.addEventListener("click", () => this.onPinClick?.(comment.id));

      // Pin number
      const num = document.createElement("div");
      num.className = `prevuiw-sidebar-num${comment.isResolved ? " resolved" : ""}`;
      num.textContent = String(topLevel.indexOf(comment) + 1);

      // Avatar
      const authorName = comment.author?.name || comment.reviewerName || "Anonymous";
      const avatar = document.createElement("div");
      avatar.className = "prevuiw-sidebar-avatar";
      if (comment.author?.avatarUrl) {
        const img = document.createElement("img");
        img.src = comment.author.avatarUrl;
        img.alt = authorName;
        avatar.appendChild(img);
      } else {
        avatar.textContent = authorName.charAt(0).toUpperCase();
      }

      // Content wrapper
      const content = document.createElement("div");
      content.className = "prevuiw-sidebar-content";

      // Author + time
      const meta = document.createElement("div");
      meta.className = "prevuiw-sidebar-meta";

      const authorSpan = document.createElement("span");
      authorSpan.className = "prevuiw-sidebar-author";
      authorSpan.textContent = authorName;

      const timeSpan = document.createElement("span");
      timeSpan.className = "prevuiw-sidebar-time";
      timeSpan.textContent = this.formatTime(comment.createdAt);

      meta.appendChild(authorSpan);
      meta.appendChild(timeSpan);

      // Comment text
      const text = document.createElement("p");
      text.className = "prevuiw-sidebar-text";
      text.textContent = comment.content;

      content.appendChild(meta);
      content.appendChild(text);

      // Reactions
      if (comment.reactions && comment.reactions.length > 0) {
        const reactionsDiv = document.createElement("div");
        reactionsDiv.className = "prevuiw-sidebar-reactions";
        const grouped: Record<string, number> = {};
        comment.reactions.forEach(r => { grouped[r.emoji] = (grouped[r.emoji] || 0) + 1; });
        Object.entries(grouped).forEach(([emoji, count]) => {
          const badge = document.createElement("button");
          badge.className = "prevuiw-reaction-badge";
          badge.textContent = `${emoji} ${count}`;
          reactionsDiv.appendChild(badge);
        });
        content.appendChild(reactionsDiv);
      }

      // Actions row
      const actions = document.createElement("div");
      actions.className = "prevuiw-sidebar-actions";

      // Resolve button — checkbox style
      const resolveBtn = document.createElement("button");
      resolveBtn.className = comment.isResolved ? "resolve-action resolved" : "resolve-action";
      resolveBtn.innerHTML = comment.isResolved
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg><span>Resolved</span>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg><span>Resolve</span>`;
      resolveBtn.addEventListener("click", (e) => { e.stopPropagation(); this.onResolve?.(comment.id); });

      // Reply button
      const replyBtn = document.createElement("button");
      replyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`;
      const replyCount = comment.replies?.length || 0;
      if (replyCount > 0) {
        const countSpan = document.createElement("span");
        countSpan.style.cssText = "font-size:11px;color:#888;margin-left:2px;";
        countSpan.textContent = String(replyCount);
        replyBtn.appendChild(countSpan);
      }

      // Emoji button + picker (wrapped for positioning)
      const emojiWrap = document.createElement("div");
      emojiWrap.className = "prevuiw-emoji-wrap";

      const emojiBtn = document.createElement("button");
      emojiBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`;

      const emojiPicker = document.createElement("div");
      emojiPicker.className = "prevuiw-emoji-picker";
      emojiPicker.style.display = "none";
      const EMOJIS = ["\uD83D\uDC4D", "\uD83D\uDC4E", "\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83C\uDF89"];
      EMOJIS.forEach(emoji => {
        const btn = document.createElement("button");
        btn.textContent = emoji;
        btn.addEventListener("click", (e) => { e.stopPropagation(); this.onEmojiAdd?.(comment.id, emoji); emojiPicker.style.display = "none"; });
        emojiPicker.appendChild(btn);
      });
      emojiBtn.addEventListener("click", (e) => { e.stopPropagation(); emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none"; });

      emojiWrap.appendChild(emojiBtn);
      emojiWrap.appendChild(emojiPicker);

      // Reply textarea
      const replyWrap = document.createElement("div");
      replyWrap.className = "prevuiw-sidebar-reply-wrap";
      replyWrap.style.display = "none";
      const replyTextarea = document.createElement("textarea");
      replyTextarea.className = "prevuiw-sidebar-reply-textarea";
      replyTextarea.placeholder = "Write a reply...";
      replyTextarea.rows = 2;
      const sendBtn = document.createElement("button");
      sendBtn.className = "prevuiw-sidebar-reply-send";
      sendBtn.textContent = "Send";
      sendBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const val = replyTextarea.value.trim();
        if (!val || !this.onReply) return;
        sendBtn.textContent = "...";
        await this.onReply(comment.id, val);
        sendBtn.textContent = "Send";
        replyTextarea.value = "";
        replyWrap.style.display = "none";
      });
      replyTextarea.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendBtn.click(); });
      replyTextarea.addEventListener("click", (e) => e.stopPropagation());
      replyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const show = replyWrap.style.display === "none";
        replyWrap.style.display = show ? "flex" : "none";
        if (show) setTimeout(() => replyTextarea.focus(), 50);
      });
      replyWrap.appendChild(replyTextarea);
      replyWrap.appendChild(sendBtn);

      actions.appendChild(resolveBtn);
      actions.appendChild(replyBtn);
      actions.appendChild(emojiWrap);
      content.appendChild(actions);
      content.appendChild(replyWrap);

      // Replies list
      if (comment.replies && comment.replies.length > 0) {
        const repliesList = document.createElement("div");
        repliesList.className = "prevuiw-sidebar-replies-list";
        comment.replies.forEach(reply => {
          const r = document.createElement("div");
          r.className = "prevuiw-sidebar-reply-item";
          const rAuthor = reply.author?.name || reply.reviewerName || "Anonymous";
          const authorSpan2 = document.createElement("span");
          authorSpan2.className = "prevuiw-reply-author";
          authorSpan2.textContent = rAuthor;
          const timeSpan2 = document.createElement("span");
          timeSpan2.className = "prevuiw-reply-time";
          timeSpan2.textContent = ` \u00b7 ${this.formatTime(reply.createdAt)}`;
          const contentDiv = document.createElement("div");
          contentDiv.className = "prevuiw-reply-content";
          contentDiv.textContent = reply.content;
          r.appendChild(authorSpan2);
          r.appendChild(timeSpan2);
          r.appendChild(contentDiv);
          repliesList.appendChild(r);
        });
        content.appendChild(repliesList);
      }

      item.appendChild(num);
      item.appendChild(avatar);
      item.appendChild(content);
      this.listEl.appendChild(item);
    });
  }

  private formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  }

  destroy() {
    document.body.style.marginRight = "";
    this.el.remove();
  }
}
