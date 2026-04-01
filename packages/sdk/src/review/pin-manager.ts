import type { CommentData } from "./types";

export class PinManager {
  private container: HTMLDivElement;
  private pins = new Map<string, HTMLDivElement>();
  private activePopover: HTMLDivElement | null = null;
  private hoverPopover: HTMLDivElement | null = null;
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private expandedPopovers: HTMLDivElement[] = [];
  private allExpanded = false;
  private commentsRef: CommentData[] = [];
  private onReply: ((commentId: string, content: string) => Promise<void>) | null = null;
  private onResolve: ((commentId: string) => void) | null = null;
  private onEmojiAdd: ((commentId: string, emoji: string) => void) | null = null;

  constructor(private shadowRoot: ShadowRoot) {
    this.container = document.createElement("div");
    this.container.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
    shadowRoot.appendChild(this.container);
  }

  renderPins(comments: CommentData[], skipExpandRefresh = false) {
    this.commentsRef = comments;
    const commentIds = new Set(comments.map((c) => c.id));
    for (const [id, el] of this.pins) {
      if (!commentIds.has(id)) {
        el.remove();
        this.pins.delete(id);
      }
    }

    comments.forEach((comment, index) => {
      if (this.pins.has(comment.id)) {
        this.updatePinPosition(comment);
        return;
      }

      const pin = document.createElement("div");
      pin.className = "prevuiw-pin";
      pin.dataset.commentId = comment.id;

      const label = document.createElement("span");
      label.textContent = String(index + 1);
      pin.appendChild(label);

      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeHoverPopover();
        this.showPopover(comment, pin);
      });

      pin.addEventListener("mouseenter", () => {
        if (this.activePopover) return; // click popover is open, skip hover
        this.hoverTimeout = setTimeout(() => {
          this.showHoverPopover(comment, pin);
        }, 300);
      });

      pin.addEventListener("mouseleave", () => {
        if (this.hoverTimeout) {
          clearTimeout(this.hoverTimeout);
          this.hoverTimeout = null;
        }
        // Delay close so user can move mouse into the popover
        setTimeout(() => {
          if (this.hoverPopover && !this.hoverPopover.matches(":hover")) {
            this.closeHoverPopover();
          }
        }, 200);
      });

      this.container.appendChild(pin);
      this.pins.set(comment.id, pin);
      this.updatePinPosition(comment);
    });

    if (this.allExpanded && !skipExpandRefresh) {
      this.expandAll(comments);
    }
  }

  private createPopoverElement(comment: CommentData, pinEl: HTMLDivElement, showClose: boolean): HTMLDivElement {
    const popover = document.createElement("div");
    popover.className = "prevuiw-popover";

    const header = document.createElement("div");
    header.className = "prevuiw-popover-header";

    const authorInfo = document.createElement("div");
    const authorName = document.createElement("span");
    authorName.className = "prevuiw-popover-author";
    authorName.textContent = comment.author?.name || comment.guestName || "Anonymous";
    const time = document.createElement("span");
    time.className = "prevuiw-popover-time";
    time.textContent = " · " + this.formatTime(comment.createdAt);
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(time);

    header.appendChild(authorInfo);

    if (showClose) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "prevuiw-popover-close";
      closeBtn.textContent = "\u00d7";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closePopover();
      });
      header.appendChild(closeBtn);
    }

    const content = document.createElement("div");
    content.className = "prevuiw-popover-content";
    content.textContent = comment.content;

    popover.appendChild(header);
    popover.appendChild(content);

    // Reactions display
    if (comment.reactions && comment.reactions.length > 0) {
      const reactionsDiv = document.createElement("div");
      reactionsDiv.className = "prevuiw-reactions";
      const grouped: Record<string, number> = {};
      comment.reactions.forEach(r => { grouped[r.emoji] = (grouped[r.emoji] || 0) + 1; });
      Object.entries(grouped).forEach(([emoji, count]) => {
        const badge = document.createElement("span");
        badge.className = "prevuiw-reaction-badge";
        badge.textContent = `${emoji} ${count}`;
        reactionsDiv.appendChild(badge);
      });
      popover.appendChild(reactionsDiv);
    }

    // Actions bar (only in click popover)
    if (showClose) {
      const actions = document.createElement("div");
      actions.className = "prevuiw-popover-actions";

      // Emoji picker
      const emojiWrap = document.createElement("div");
      emojiWrap.style.cssText = "position:relative;display:inline-flex;";

      const emojiBtn = document.createElement("button");
      emojiBtn.className = "resolve-btn";
      emojiBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`;

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
        emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none";
      });

      emojiWrap.appendChild(emojiBtn);
      emojiWrap.appendChild(emojiPicker);

      // Resolve button
      const resolveBtn = document.createElement("button");
      resolveBtn.className = comment.isResolved ? "resolve-btn resolved" : "resolve-btn";
      resolveBtn.innerHTML = comment.isResolved
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>Resolved</span>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg><span>Resolve</span>`;
      resolveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onResolve?.(comment.id);
      });

      actions.appendChild(resolveBtn);
      actions.appendChild(emojiWrap);
      popover.appendChild(actions);
    }

    // Replies section
    if (comment.replies && comment.replies.length > 0) {
      const repliesDiv = document.createElement("div");
      repliesDiv.className = "prevuiw-replies";

      comment.replies.forEach((reply) => {
        const replyEl = document.createElement("div");
        replyEl.className = "prevuiw-reply";

        const replyHeader = document.createElement("div");
        const replyAuthor = document.createElement("span");
        replyAuthor.className = "prevuiw-reply-author";
        replyAuthor.textContent = reply.author?.name || reply.guestName || "Anonymous";
        const replyTime = document.createElement("span");
        replyTime.className = "prevuiw-reply-time";
        replyTime.textContent = " · " + this.formatTime(reply.createdAt);
        replyHeader.appendChild(replyAuthor);
        replyHeader.appendChild(replyTime);

        const replyContent = document.createElement("div");
        replyContent.className = "prevuiw-reply-content";
        replyContent.textContent = reply.content;

        replyEl.appendChild(replyHeader);
        replyEl.appendChild(replyContent);
        repliesDiv.appendChild(replyEl);
      });

      popover.appendChild(repliesDiv);
    }

    // Reply input (only for click popovers, not hover)
    if (showClose) {
      const replyInputDiv = document.createElement("div");
      replyInputDiv.className = "prevuiw-reply-input";

      const replyInput = document.createElement("input");
      replyInput.placeholder = "Reply...";

      const replyBtn = document.createElement("button");
      replyBtn.textContent = "Reply";
      replyBtn.addEventListener("click", async () => {
        const text = replyInput.value.trim();
        if (!text || !this.onReply) return;
        replyBtn.textContent = "...";
        await this.onReply(comment.id, text);
        replyBtn.textContent = "Reply";
        replyInput.value = "";
      });

      replyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") replyBtn.click();
      });

      replyInputDiv.appendChild(replyInput);
      replyInputDiv.appendChild(replyBtn);
      popover.appendChild(replyInputDiv);
    }

    const pinLeft = parseInt(pinEl.style.left) || 0;
    const pinTop = parseInt(pinEl.style.top) || 0;
    popover.style.left = `${pinLeft + 36}px`;
    popover.style.top = `${pinTop - 10}px`;

    return popover;
  }

  private showPopover(comment: CommentData, pinEl: HTMLDivElement) {
    this.closePopover();

    const popover = this.createPopoverElement(comment, pinEl, true);
    this.container.appendChild(popover);
    this.activePopover = popover;

    const onClickOutside = (e: MouseEvent) => {
      if (!popover.contains(e.target as Node) && !pinEl.contains(e.target as Node)) {
        this.closePopover();
        document.removeEventListener("click", onClickOutside, true);
      }
    };
    setTimeout(() => document.addEventListener("click", onClickOutside, true), 0);
  }

  private showHoverPopover(comment: CommentData, pinEl: HTMLDivElement) {
    this.closeHoverPopover();

    const popover = this.createPopoverElement(comment, pinEl, false);
    popover.addEventListener("mouseleave", () => {
      this.closeHoverPopover();
    });

    this.container.appendChild(popover);
    this.hoverPopover = popover;
  }

  private closeHoverPopover() {
    if (this.hoverPopover) {
      this.hoverPopover.remove();
      this.hoverPopover = null;
    }
  }

  private closePopover() {
    if (this.activePopover) {
      this.activePopover.remove();
      this.activePopover = null;
    }
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

  private updatePinPosition(comment: CommentData) {
    const pin = this.pins.get(comment.id);
    if (!pin) return;

    let positioned = false;

    if (comment.cssSelector) {
      try {
        const el = document.querySelector(comment.cssSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          pin.style.left = `${rect.right + window.scrollX}px`;
          pin.style.top = `${rect.top + window.scrollY}px`;
          pin.classList.remove("warn");
          positioned = true;
        }
      } catch {
        // Invalid selector, fall through
      }
    }

    if (!positioned) {
      const scrollWidth = document.documentElement.scrollWidth;
      const scrollHeight = document.documentElement.scrollHeight;
      pin.style.left = `${(comment.posX / 100) * scrollWidth}px`;
      pin.style.top = `${(comment.posY / 100) * scrollHeight}px`;

      if (comment.cssSelector) {
        pin.classList.add("warn");
      }
    }

    pin.style.pointerEvents = "auto";
  }

  setAllExpanded(expanded: boolean, comments: CommentData[]) {
    this.allExpanded = expanded;
    if (expanded) {
      this.expandAll(comments);
    } else {
      this.collapseAll();
    }
  }

  private expandAll(comments: CommentData[]) {
    this.collapseAll();
    this.closePopover();
    this.closeHoverPopover();

    comments.forEach((comment) => {
      const pin = this.pins.get(comment.id);
      if (!pin) return;

      const popover = this.createPopoverElement(comment, pin, false);
      this.container.appendChild(popover);
      this.expandedPopovers.push(popover);
    });
  }

  private collapseAll() {
    this.expandedPopovers.forEach((p) => p.remove());
    this.expandedPopovers = [];
  }

  setOnReply(callback: (commentId: string, content: string) => Promise<void>) {
    this.onReply = callback;
  }

  setOnResolve(callback: (commentId: string) => void) {
    this.onResolve = callback;
  }

  setOnEmojiAdd(callback: (commentId: string, emoji: string) => void) {
    this.onEmojiAdd = callback;
  }

  setVisible(visible: boolean) {
    this.container.style.display = visible ? "block" : "none";
    if (!visible) this.closePopover();
  }

  updateAllPositions(comments: CommentData[]) {
    comments.forEach((c) => this.updatePinPosition(c));
  }

  destroy() {
    this.closePopover();
    this.container.remove();
    this.pins.clear();
  }
}
