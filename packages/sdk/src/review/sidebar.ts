import type { CommentData } from "./types";

export class Sidebar {
  private el: HTMLDivElement;
  private listEl: HTMLDivElement;
  private countEl: HTMLSpanElement;
  private filterBtns: HTMLButtonElement[] = [];
  private filter: "all" | "open" | "resolved" = "all";
  private comments: CommentData[] = [];
  private isOpen = false;
  private onPinClick: ((commentId: string) => void) | null = null;
  private onReply: ((commentId: string, content: string) => Promise<void>) | null = null;
  private onResolve: ((commentId: string) => void) | null = null;
  private onEmojiAdd: ((commentId: string, emoji: string) => void) | null = null;

  constructor(private shadowRoot: ShadowRoot) {
    this.el = document.createElement("div");
    this.el.className = "prevuiw-sidebar";

    // Header
    const header = document.createElement("div");
    header.className = "prevuiw-sidebar-header";

    const titleWrap = document.createElement("div");
    titleWrap.style.cssText = "display:flex;align-items:center;gap:6px;";
    const title = document.createElement("span");
    title.style.cssText = "font-size:13px;font-weight:600;";
    title.textContent = "Comments";
    this.countEl = document.createElement("span");
    this.countEl.style.cssText = "font-size:11px;color:#888;";
    this.countEl.textContent = "(0)";
    titleWrap.appendChild(title);
    titleWrap.appendChild(this.countEl);

    const closeBtn = document.createElement("button");
    closeBtn.className = "prevuiw-sidebar-close";
    closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
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

    this.el.appendChild(header);
    this.el.appendChild(tabs);
    this.el.appendChild(this.listEl);
    shadowRoot.appendChild(this.el);
  }

  setOnPinClick(cb: (commentId: string) => void) { this.onPinClick = cb; }
  setOnReply(cb: (commentId: string, content: string) => Promise<void>) { this.onReply = cb; }
  setOnResolve(cb: (commentId: string) => void) { this.onResolve = cb; }
  setOnEmojiAdd(cb: (commentId: string, emoji: string) => void) { this.onEmojiAdd = cb; }

  toggle(open?: boolean) {
    this.isOpen = open ?? !this.isOpen;
    this.el.classList.toggle("open", this.isOpen);
    if (this.isOpen) this.renderList();
  }

  isVisible() { return this.isOpen; }

  updateComments(comments: CommentData[]) {
    this.comments = comments;
    this.countEl.textContent = `(${comments.filter(c => !c.parentId).length})`;
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

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "prevuiw-sidebar-empty";
      empty.textContent = "No comments yet";
      this.listEl.appendChild(empty);
      return;
    }

    filtered.forEach((comment, index) => {
      const item = document.createElement("div");
      item.className = "prevuiw-sidebar-item";
      item.addEventListener("click", () => this.onPinClick?.(comment.id));

      // Pin number
      const num = document.createElement("div");
      num.className = "prevuiw-sidebar-num";
      num.textContent = String(topLevel.indexOf(comment) + 1);

      // Content
      const content = document.createElement("div");
      content.className = "prevuiw-sidebar-content";

      const meta = document.createElement("div");
      meta.className = "prevuiw-sidebar-meta";
      const author = comment.author?.name || comment.guestName || "Anonymous";
      const time = this.formatTime(comment.createdAt);
      meta.textContent = `${author} · ${time}`;

      const text = document.createElement("div");
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
          const badge = document.createElement("span");
          badge.className = "prevuiw-reaction-badge";
          badge.textContent = `${emoji} ${count}`;
          reactionsDiv.appendChild(badge);
        });
        content.appendChild(reactionsDiv);
      }

      // Actions row
      const actions = document.createElement("div");
      actions.className = "prevuiw-sidebar-actions";

      const resolveBtn = document.createElement("button");
      resolveBtn.className = comment.isResolved ? "resolved" : "";
      resolveBtn.innerHTML = comment.isResolved
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
      resolveBtn.title = comment.isResolved ? "Reopen" : "Resolve";
      resolveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onResolve?.(comment.id);
      });

      const replyBtn = document.createElement("button");
      replyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`;
      replyBtn.title = "Reply";

      const replyCount = comment.replies?.length || 0;
      if (replyCount > 0) {
        const countSpan = document.createElement("span");
        countSpan.style.cssText = "font-size:10px;color:#888;margin-left:2px;";
        countSpan.textContent = String(replyCount);
        replyBtn.appendChild(countSpan);
      }

      // Reply input (toggled)
      const replyWrap = document.createElement("div");
      replyWrap.className = "prevuiw-sidebar-reply-wrap";
      replyWrap.style.display = "none";

      const replyInput = document.createElement("input");
      replyInput.className = "prevuiw-sidebar-reply-input";
      replyInput.placeholder = "Reply...";

      const sendBtn = document.createElement("button");
      sendBtn.className = "prevuiw-sidebar-reply-send";
      sendBtn.textContent = "Send";
      sendBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const val = replyInput.value.trim();
        if (!val || !this.onReply) return;
        sendBtn.textContent = "...";
        await this.onReply(comment.id, val);
        sendBtn.textContent = "Send";
        replyInput.value = "";
        replyWrap.style.display = "none";
      });

      replyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendBtn.click();
      });
      replyInput.addEventListener("click", (e) => e.stopPropagation());

      replyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const show = replyWrap.style.display === "none";
        replyWrap.style.display = show ? "flex" : "none";
        if (show) setTimeout(() => replyInput.focus(), 50);
      });

      replyWrap.appendChild(replyInput);
      replyWrap.appendChild(sendBtn);

      // Emoji picker button
      const emojiBtn = document.createElement("button");
      emojiBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`;
      emojiBtn.title = "Add reaction";

      const emojiPicker = document.createElement("div");
      emojiPicker.className = "prevuiw-emoji-picker";
      emojiPicker.style.display = "none";

      const EMOJIS = ["\uD83D\uDC4D", "\uD83D\uDC4E", "\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83C\uDF89"];
      EMOJIS.forEach(emoji => {
        const btn = document.createElement("button");
        btn.textContent = emoji;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onEmojiAdd?.(comment.id, emoji);
          emojiPicker.style.display = "none";
        });
        emojiPicker.appendChild(btn);
      });

      emojiBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const show = emojiPicker.style.display === "none";
        emojiPicker.style.display = show ? "flex" : "none";
      });

      actions.appendChild(resolveBtn);
      actions.appendChild(replyBtn);
      actions.appendChild(emojiBtn);
      content.appendChild(actions);
      content.appendChild(emojiPicker);
      content.appendChild(replyWrap);

      // Replies list
      if (comment.replies && comment.replies.length > 0) {
        const repliesList = document.createElement("div");
        repliesList.className = "prevuiw-sidebar-replies-list";
        comment.replies.forEach(reply => {
          const r = document.createElement("div");
          r.className = "prevuiw-sidebar-reply-item";
          const rAuthor = reply.author?.name || reply.guestName || "Anonymous";
          r.innerHTML = `<span class="prevuiw-reply-author">${rAuthor}</span> <span class="prevuiw-reply-time">${this.formatTime(reply.createdAt)}</span><div class="prevuiw-reply-content">${reply.content}</div>`;
          repliesList.appendChild(r);
        });
        content.appendChild(repliesList);
      }

      item.appendChild(num);
      item.appendChild(content);

      if (comment.isResolved) {
        num.style.background = "#10b981";
      }

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

  destroy() { this.el.remove(); }
}
