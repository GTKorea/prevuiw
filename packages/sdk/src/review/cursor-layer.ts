import type { CursorInfo } from "./types";

const COLORS = ["#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#3b82f6"];

export class CursorLayer {
  private container: HTMLDivElement;
  private cursors = new Map<string, HTMLDivElement>();
  private colorIndex = 0;
  private socketColors = new Map<string, string>();

  constructor(private shadowRoot: ShadowRoot) {
    this.container = document.createElement("div");
    this.container.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
    shadowRoot.appendChild(this.container);
  }

  private getColor(socketId: string): string {
    if (!this.socketColors.has(socketId)) {
      this.socketColors.set(socketId, COLORS[this.colorIndex % COLORS.length]);
      this.colorIndex++;
    }
    return this.socketColors.get(socketId)!;
  }

  updateCursor(data: CursorInfo) {
    let cursorEl = this.cursors.get(data.socketId);

    if (!cursorEl) {
      const color = this.getColor(data.socketId);
      cursorEl = document.createElement("div");
      cursorEl.className = "prevuiw-cursor";

      const dot = document.createElement("div");
      dot.className = "prevuiw-cursor-dot";
      dot.style.background = color;

      const nameTag = document.createElement("div");
      nameTag.className = "prevuiw-cursor-name";
      nameTag.style.background = color;
      nameTag.textContent = data.name;

      cursorEl.appendChild(dot);
      cursorEl.appendChild(nameTag);
      this.container.appendChild(cursorEl);
      this.cursors.set(data.socketId, cursorEl);
    }

    const x = (data.x / 100) * document.documentElement.scrollWidth;
    const y = (data.y / 100) * document.documentElement.scrollHeight;
    cursorEl.style.left = `${x}px`;
    cursorEl.style.top = `${y}px`;
  }

  removeCursor(socketId: string) {
    const el = this.cursors.get(socketId);
    if (el) {
      el.remove();
      this.cursors.delete(socketId);
      this.socketColors.delete(socketId);
    }
  }

  setVisible(visible: boolean) {
    this.container.style.display = visible ? "block" : "none";
  }

  destroy() {
    this.container.remove();
    this.cursors.clear();
    this.socketColors.clear();
  }
}
