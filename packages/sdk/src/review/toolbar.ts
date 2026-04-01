export type ToolbarMode = "browse" | "annotate";

// SVG icons matching Lucide icons used in iframe toolbar
const ICONS = {
  pointer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>`,
  comment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`,
  eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.749 10.749 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`,
  panelRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>`,
};

export class Toolbar {
  private el: HTMLDivElement;
  private browseBtn: HTMLButtonElement;
  private annotateBtn: HTMLButtonElement;
  private eyeToggleBtn: HTMLButtonElement;
  private expandToggleBtn: HTMLButtonElement;
  private statusEl: HTMLDivElement;
  private mode: ToolbarMode = "browse";
  private pinsVisible = true;
  private allExpanded = false;
  private onModeChange: (mode: ToolbarMode) => void;
  private onPinsToggle: (visible: boolean) => void;
  private onExpandToggle: (expanded: boolean) => void;

  constructor(
    shadowRoot: ShadowRoot,
    onModeChange: (mode: ToolbarMode) => void,
    onPinsToggle: (visible: boolean) => void,
    onExpandToggle: (expanded: boolean) => void,
  ) {
    this.onModeChange = onModeChange;
    this.onPinsToggle = onPinsToggle;
    this.onExpandToggle = onExpandToggle;

    this.el = document.createElement("div");
    this.el.className = "prevuiw-toolbar";

    // Browse button
    this.browseBtn = document.createElement("button");
    this.browseBtn.className = "active";
    this.browseBtn.innerHTML = `${ICONS.pointer}<span>Browse</span><kbd>V</kbd>`;
    this.browseBtn.addEventListener("click", () => this.setMode("browse"));

    // Divider
    const div1 = this.createDivider();

    // Annotate button
    this.annotateBtn = document.createElement("button");
    this.annotateBtn.innerHTML = `${ICONS.comment}<span>Comment</span><kbd>\u2318</kbd>`;
    this.annotateBtn.addEventListener("click", () => this.setMode("annotate"));

    // Divider
    const div2 = this.createDivider();

    // Eye toggle
    this.eyeToggleBtn = document.createElement("button");
    this.eyeToggleBtn.className = "icon-toggle active";
    this.eyeToggleBtn.innerHTML = ICONS.eye;
    this.eyeToggleBtn.title = "Show/hide pins";
    this.eyeToggleBtn.addEventListener("click", () => this.togglePins());

    // Expand toggle
    this.expandToggleBtn = document.createElement("button");
    this.expandToggleBtn.className = "icon-toggle";
    this.expandToggleBtn.innerHTML = ICONS.panelRight;
    this.expandToggleBtn.title = "Expand/collapse all comments";
    this.expandToggleBtn.addEventListener("click", () => this.toggleExpand());

    // Status
    this.statusEl = document.createElement("div");
    this.statusEl.className = "status";
    this.statusEl.textContent = "Connecting...";

    this.el.appendChild(this.browseBtn);
    this.el.appendChild(div1);
    this.el.appendChild(this.annotateBtn);
    this.el.appendChild(div2);
    this.el.appendChild(this.eyeToggleBtn);
    this.el.appendChild(this.expandToggleBtn);
    this.el.appendChild(this.statusEl);

    shadowRoot.appendChild(this.el);
  }

  private createDivider(): HTMLDivElement {
    const div = document.createElement("div");
    div.className = "divider";
    return div;
  }

  private togglePins() {
    this.pinsVisible = !this.pinsVisible;
    this.eyeToggleBtn.className = this.pinsVisible ? "icon-toggle active" : "icon-toggle";
    this.eyeToggleBtn.innerHTML = this.pinsVisible ? ICONS.eye : ICONS.eyeOff;
    this.onPinsToggle(this.pinsVisible);
  }

  private toggleExpand() {
    this.allExpanded = !this.allExpanded;
    this.expandToggleBtn.className = this.allExpanded ? "icon-toggle active" : "icon-toggle";
    this.onExpandToggle(this.allExpanded);
  }

  setMode(mode: ToolbarMode) {
    this.mode = mode;
    this.browseBtn.className = mode === "browse" ? "active" : "";
    this.annotateBtn.className = mode === "annotate" ? "active" : "";
    this.onModeChange(mode);
  }

  getMode(): ToolbarMode { return this.mode; }
  setStatus(text: string) { this.statusEl.textContent = text; }
  destroy() { this.el.remove(); }
}
