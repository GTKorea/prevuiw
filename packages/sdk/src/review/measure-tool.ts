export class MeasureTool {
  private shadowRoot: ShadowRoot;
  private sourceEl: Element | null = null;
  private sourceHighlight: HTMLDivElement;
  private targetHighlight: HTMLDivElement;
  private measureContainer: HTMLDivElement;
  private active = false;
  private onExit: () => void;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundClick: (e: MouseEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(shadowRoot: ShadowRoot, onExit: () => void) {
    this.shadowRoot = shadowRoot;
    this.onExit = onExit;

    this.sourceHighlight = document.createElement("div");
    this.sourceHighlight.className = "prevuiw-measure-source";
    this.sourceHighlight.style.display = "none";

    this.targetHighlight = document.createElement("div");
    this.targetHighlight.className = "prevuiw-measure-target";
    this.targetHighlight.style.display = "none";

    this.measureContainer = document.createElement("div");
    this.measureContainer.className = "prevuiw-measure-container";
    this.measureContainer.style.display = "none";

    shadowRoot.appendChild(this.sourceHighlight);
    shadowRoot.appendChild(this.targetHighlight);
    shadowRoot.appendChild(this.measureContainer);

    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundClick = this.handleClick.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  start() {
    this.active = true;
    document.addEventListener("mousemove", this.boundMouseMove, true);
    document.addEventListener("click", this.boundClick, true);
    document.addEventListener("keydown", this.boundKeyDown, true);
  }

  stop() {
    this.active = false;
    document.removeEventListener("mousemove", this.boundMouseMove, true);
    document.removeEventListener("click", this.boundClick, true);
    document.removeEventListener("keydown", this.boundKeyDown, true);
    this.clearSource();
    this.sourceHighlight.style.display = "none";
    this.targetHighlight.style.display = "none";
    this.measureContainer.style.display = "none";
  }

  destroy() {
    this.stop();
    this.sourceHighlight.remove();
    this.targetHighlight.remove();
    this.measureContainer.remove();
  }

  private clearSource() {
    this.sourceEl = null;
    this.sourceHighlight.style.display = "none";
    this.targetHighlight.style.display = "none";
    this.measureContainer.style.display = "none";
    this.measureContainer.innerHTML = "";
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.active) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target.id === "prevuiw-root") {
      if (!this.sourceEl) this.sourceHighlight.style.display = "none";
      this.targetHighlight.style.display = "none";
      this.measureContainer.style.display = "none";
      return;
    }

    if (!this.sourceEl) {
      // No source selected — show hover highlight
      const rect = target.getBoundingClientRect();
      this.positionEl(this.sourceHighlight, rect);
      this.sourceHighlight.style.display = "block";
      return;
    }

    // Source is selected
    if (e.altKey) {
      // Alt held — show measurements
      const targetRect = target.getBoundingClientRect();
      const sourceRect = this.sourceEl.getBoundingClientRect();

      this.positionEl(this.targetHighlight, targetRect);
      this.targetHighlight.style.display = "block";
      this.measureContainer.style.display = "block";

      this.renderMeasurements(sourceRect, targetRect, target === this.sourceEl);
    } else {
      this.targetHighlight.style.display = "none";
      this.measureContainer.style.display = "none";
      this.measureContainer.innerHTML = "";
    }
  }

  private handleClick(e: MouseEvent) {
    if (!this.active) return;

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target.id === "prevuiw-root") return;

    e.preventDefault();
    e.stopPropagation();

    if (this.sourceEl === target) {
      // Click same element — deselect
      this.clearSource();
      return;
    }

    // Select new source
    this.sourceEl = target;
    const rect = target.getBoundingClientRect();
    this.positionEl(this.sourceHighlight, rect);
    this.sourceHighlight.style.display = "block";
    this.targetHighlight.style.display = "none";
    this.measureContainer.style.display = "none";
    this.measureContainer.innerHTML = "";
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (this.sourceEl) {
        this.clearSource();
      } else {
        this.onExit();
      }
    }
  }

  private positionEl(el: HTMLDivElement, rect: DOMRect) {
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
  }

  private renderMeasurements(s: DOMRect, t: DOMRect, sameElement: boolean) {
    this.measureContainer.innerHTML = "";

    if (sameElement) {
      // Show element dimensions
      this.addHLine(s.left, s.right, s.top - 8, `${Math.round(s.width)}px`);
      this.addVLine(s.left - 8, s.top, s.bottom, `${Math.round(s.height)}px`);
      return;
    }

    // Horizontal relationship
    const hGap = this.getGap(s.left, s.right, t.left, t.right);
    // Vertical relationship
    const vGap = this.getGap(s.top, s.bottom, t.top, t.bottom);

    // Overlap ranges for centering lines
    const hOverlapStart = Math.max(s.left, t.left);
    const hOverlapEnd = Math.min(s.right, t.right);
    const vOverlapStart = Math.max(s.top, t.top);
    const vOverlapEnd = Math.min(s.bottom, t.bottom);

    const hasHOverlap = hOverlapEnd > hOverlapStart;
    const hasVOverlap = vOverlapEnd > vOverlapStart;

    if (hGap.distance > 0) {
      // Horizontal gap exists
      const y = hasVOverlap
        ? (vOverlapStart + vOverlapEnd) / 2
        : (Math.min(s.bottom, t.bottom) + Math.max(s.top, t.top)) / 2;
      this.addHLine(hGap.start, hGap.end, y, `${Math.round(hGap.distance)}px`);
    }

    if (vGap.distance > 0) {
      // Vertical gap exists
      const x = hasHOverlap
        ? (hOverlapStart + hOverlapEnd) / 2
        : (Math.min(s.right, t.right) + Math.max(s.left, t.left)) / 2;
      this.addVLine(x, vGap.start, vGap.end, `${Math.round(vGap.distance)}px`);
    }

    if (hGap.distance === 0 && vGap.distance === 0) {
      // Elements overlap — show edge distances from inner to outer
      // Top distance
      const innerTop = Math.max(s.top, t.top);
      const outerTop = Math.min(s.top, t.top);
      if (innerTop > outerTop) {
        const x = (Math.max(s.left, t.left) + Math.min(s.right, t.right)) / 2;
        this.addVLine(x, outerTop, innerTop, `${Math.round(innerTop - outerTop)}px`);
      }
      // Left distance
      const innerLeft = Math.max(s.left, t.left);
      const outerLeft = Math.min(s.left, t.left);
      if (innerLeft > outerLeft) {
        const y = (Math.max(s.top, t.top) + Math.min(s.bottom, t.bottom)) / 2;
        this.addHLine(outerLeft, innerLeft, y, `${Math.round(innerLeft - outerLeft)}px`);
      }
      // Bottom distance
      const innerBottom = Math.min(s.bottom, t.bottom);
      const outerBottom = Math.max(s.bottom, t.bottom);
      if (outerBottom > innerBottom) {
        const x = (Math.max(s.left, t.left) + Math.min(s.right, t.right)) / 2;
        this.addVLine(x, innerBottom, outerBottom, `${Math.round(outerBottom - innerBottom)}px`);
      }
      // Right distance
      const innerRight = Math.min(s.right, t.right);
      const outerRight = Math.max(s.right, t.right);
      if (outerRight > innerRight) {
        const y = (Math.max(s.top, t.top) + Math.min(s.bottom, t.bottom)) / 2;
        this.addHLine(innerRight, outerRight, y, `${Math.round(outerRight - innerRight)}px`);
      }
    }
  }

  private getGap(sStart: number, sEnd: number, tStart: number, tEnd: number) {
    if (tStart >= sEnd) return { distance: tStart - sEnd, start: sEnd, end: tStart };
    if (tEnd <= sStart) return { distance: sStart - tEnd, start: tEnd, end: sStart };
    return { distance: 0, start: 0, end: 0 };
  }

  private addHLine(x1: number, x2: number, y: number, label: string) {
    const width = Math.abs(x2 - x1);
    const left = Math.min(x1, x2);

    // Main line
    const line = document.createElement("div");
    line.className = "prevuiw-measure-line h";
    line.style.left = `${left}px`;
    line.style.top = `${y}px`;
    line.style.width = `${width}px`;
    this.measureContainer.appendChild(line);

    // End caps
    this.addCap(left, y, true);
    this.addCap(left + width, y, true);

    // Label
    const lbl = document.createElement("div");
    lbl.className = "prevuiw-measure-label";
    lbl.textContent = label;
    lbl.style.left = `${left + width / 2}px`;
    lbl.style.top = `${y - 18}px`;
    lbl.style.transform = "translateX(-50%)";
    this.measureContainer.appendChild(lbl);
  }

  private addVLine(x: number, y1: number, y2: number, label: string) {
    const height = Math.abs(y2 - y1);
    const top = Math.min(y1, y2);

    // Main line
    const line = document.createElement("div");
    line.className = "prevuiw-measure-line v";
    line.style.left = `${x}px`;
    line.style.top = `${top}px`;
    line.style.height = `${height}px`;
    this.measureContainer.appendChild(line);

    // End caps
    this.addCap(x, top, false);
    this.addCap(x, top + height, false);

    // Label
    const lbl = document.createElement("div");
    lbl.className = "prevuiw-measure-label";
    lbl.textContent = label;
    lbl.style.left = `${x + 8}px`;
    lbl.style.top = `${top + height / 2}px`;
    lbl.style.transform = "translateY(-50%)";
    this.measureContainer.appendChild(lbl);
  }

  private addCap(x: number, y: number, horizontal: boolean) {
    const cap = document.createElement("div");
    cap.className = "prevuiw-measure-cap";
    if (horizontal) {
      // Vertical cap at horizontal line endpoint
      cap.style.left = `${x}px`;
      cap.style.top = `${y - 4}px`;
      cap.style.width = "1px";
      cap.style.height = "8px";
    } else {
      // Horizontal cap at vertical line endpoint
      cap.style.left = `${x - 4}px`;
      cap.style.top = `${y}px`;
      cap.style.width = "8px";
      cap.style.height = "1px";
    }
    this.measureContainer.appendChild(cap);
  }
}
