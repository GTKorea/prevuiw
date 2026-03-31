export type ToolbarMode = "browse" | "annotate";

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

    const logo = document.createElement("div");
    logo.style.cssText = "font-weight:700;font-size:13px;color:#3b82f6;padding:0 4px;";
    logo.textContent = "prevuiw";

    this.browseBtn = document.createElement("button");
    this.browseBtn.textContent = "Browse";
    this.browseBtn.className = "active";
    this.browseBtn.addEventListener("click", () => this.setMode("browse"));

    this.annotateBtn = document.createElement("button");
    this.annotateBtn.textContent = "Annotate";
    this.annotateBtn.addEventListener("click", () => this.setMode("annotate"));

    this.eyeToggleBtn = document.createElement("button");
    this.eyeToggleBtn.className = "icon-toggle active";
    this.eyeToggleBtn.textContent = "\ud83d\udc41";
    this.eyeToggleBtn.title = "Show/hide pins";
    this.eyeToggleBtn.addEventListener("click", () => this.togglePins());

    this.expandToggleBtn = document.createElement("button");
    this.expandToggleBtn.className = "icon-toggle";
    this.expandToggleBtn.textContent = "\ud83d\udcac";
    this.expandToggleBtn.title = "Expand/collapse all comments";
    this.expandToggleBtn.addEventListener("click", () => this.toggleExpand());

    this.statusEl = document.createElement("div");
    this.statusEl.className = "status";
    this.statusEl.textContent = "Connecting...";

    this.el.appendChild(logo);
    this.el.appendChild(this.browseBtn);
    this.el.appendChild(this.annotateBtn);
    this.el.appendChild(this.eyeToggleBtn);
    this.el.appendChild(this.expandToggleBtn);
    this.el.appendChild(this.statusEl);

    shadowRoot.appendChild(this.el);
  }

  private togglePins() {
    this.pinsVisible = !this.pinsVisible;
    this.eyeToggleBtn.className = this.pinsVisible ? "icon-toggle active" : "icon-toggle";
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
