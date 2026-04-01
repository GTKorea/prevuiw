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

      // Reply count
      const replyCount = comment.replies?.length || 0;
      if (replyCount > 0) {
        const replies = document.createElement("div");
        replies.className = "prevuiw-sidebar-replies";
        replies.textContent = `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`;
        content.appendChild(meta);
        content.appendChild(text);
        content.appendChild(replies);
      } else {
        content.appendChild(meta);
        content.appendChild(text);
      }

      // Status dot
      if (comment.isResolved) {
        const dot = document.createElement("div");
        dot.className = "prevuiw-sidebar-resolved";
        dot.title = "Resolved";
        item.appendChild(num);
        item.appendChild(content);
        item.appendChild(dot);
      } else {
        item.appendChild(num);
        item.appendChild(content);
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
