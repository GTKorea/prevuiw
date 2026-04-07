import type { Viewport } from "./types";

export type ToolbarMode = "browse" | "annotate" | "measure";

const ICONS = {
  pointer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>`,
  comment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`,
  eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.749 10.749 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`,
  panelRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>`,
  mobile: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>`,
  tablet: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M12 18h.01"/></svg>`,
  laptop: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>`,
  desktop: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>`,
  user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  ruler: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>`,
};

const VIEWPORTS: { key: Viewport; icon: string; label: string; width: number }[] = [
  { key: "MOBILE_375", icon: ICONS.mobile, label: "Mobile", width: 375 },
  { key: "TABLET_768", icon: ICONS.tablet, label: "Tablet", width: 768 },
  { key: "LAPTOP_1440", icon: ICONS.laptop, label: "Laptop", width: 1440 },
  { key: "DESKTOP_1920", icon: ICONS.desktop, label: "Desktop", width: 0 },
];

export class Toolbar {
  private toolbarEl: HTMLDivElement;
  private topBarEl: HTMLDivElement;
  private browseBtn: HTMLButtonElement;
  private annotateBtn: HTMLButtonElement;
  private measureBtn: HTMLButtonElement;
  private eyeToggleBtn: HTMLButtonElement;
  private sidebarToggleBtn: HTMLButtonElement;
  private viewportBtns: HTMLButtonElement[] = [];
  private commentCountEl: HTMLSpanElement;
  private mode: ToolbarMode = "browse";
  private pinsVisible = true;
  private currentViewport: Viewport = "DESKTOP_1920";
  private onModeChange: (mode: ToolbarMode) => void;
  private onPinsToggle: (visible: boolean) => void;
  private onSidebarToggle: () => void;
  private onViewportChange: (viewport: Viewport) => void;

  constructor(
    shadowRoot: ShadowRoot,
    onModeChange: (mode: ToolbarMode) => void,
    onPinsToggle: (visible: boolean) => void,
    onSidebarToggle: () => void,
    onViewportChange: (viewport: Viewport) => void,
    reviewerName: string,
    initialViewport: Viewport = "DESKTOP_1920",
  ) {
    this.currentViewport = initialViewport;
    this.onModeChange = onModeChange;
    this.onPinsToggle = onPinsToggle;
    this.onSidebarToggle = onSidebarToggle;
    this.onViewportChange = onViewportChange;

    // ─── Top bar (viewport + user info) ───
    this.topBarEl = document.createElement("div");
    this.topBarEl.className = "prevuiw-topbar";

    // Viewport buttons
    const vpGroup = document.createElement("div");
    vpGroup.className = "prevuiw-topbar-group";
    VIEWPORTS.forEach((vp) => {
      const btn = document.createElement("button");
      btn.className = vp.key === this.currentViewport ? "active" : "";
      btn.innerHTML = `${vp.icon}<span>${vp.label}</span>`;
      btn.addEventListener("click", () => this.setViewport(vp.key));
      vpGroup.appendChild(btn);
      this.viewportBtns.push(btn);
    });

    // User badge
    const userBadge = document.createElement("div");
    userBadge.className = "prevuiw-topbar-user";
    userBadge.innerHTML = `${ICONS.user}<span>${reviewerName}</span>`;

    this.topBarEl.appendChild(vpGroup);
    this.topBarEl.appendChild(userBadge);
    shadowRoot.appendChild(this.topBarEl);

    // ─── Bottom toolbar ───
    this.toolbarEl = document.createElement("div");
    this.toolbarEl.className = "prevuiw-toolbar";

    // Browse button
    this.browseBtn = document.createElement("button");
    this.browseBtn.className = "active";
    this.browseBtn.innerHTML = `${ICONS.pointer}<span>Browse</span><kbd>V</kbd>`;
    this.browseBtn.addEventListener("click", () => this.setMode("browse"));

    const div1 = this.createDivider();

    // Annotate button
    this.annotateBtn = document.createElement("button");
    this.annotateBtn.innerHTML = `${ICONS.comment}<span>Comment</span><kbd>C</kbd>`;
    this.annotateBtn.addEventListener("click", () => this.setMode("annotate"));

    const div2 = this.createDivider();

    // Measure button
    this.measureBtn = document.createElement("button");
    this.measureBtn.innerHTML = `${ICONS.ruler}<span>Measure</span><kbd>M</kbd>`;
    this.measureBtn.addEventListener("click", () => this.setMode("measure"));

    const div3 = this.createDivider();

    // Eye toggle
    this.eyeToggleBtn = document.createElement("button");
    this.eyeToggleBtn.className = "icon-toggle active";
    this.eyeToggleBtn.innerHTML = ICONS.eye;
    this.eyeToggleBtn.title = "Show/hide pins";
    this.eyeToggleBtn.addEventListener("click", () => this.togglePins());

    // Sidebar toggle + comment count
    this.sidebarToggleBtn = document.createElement("button");
    this.sidebarToggleBtn.className = "icon-toggle active";
    this.sidebarToggleBtn.title = "Toggle comment sidebar";
    this.commentCountEl = document.createElement("span");
    this.commentCountEl.className = "comment-count";
    this.commentCountEl.textContent = "0";
    this.sidebarToggleBtn.innerHTML = ICONS.panelRight;
    this.sidebarToggleBtn.appendChild(this.commentCountEl);
    this.sidebarToggleBtn.addEventListener("click", () => this.onSidebarToggle());

    // Assemble bottom toolbar
    this.toolbarEl.appendChild(this.browseBtn);
    this.toolbarEl.appendChild(div1);
    this.toolbarEl.appendChild(this.annotateBtn);
    this.toolbarEl.appendChild(div2);
    this.toolbarEl.appendChild(this.measureBtn);
    this.toolbarEl.appendChild(div3);
    this.toolbarEl.appendChild(this.eyeToggleBtn);
    this.toolbarEl.appendChild(this.sidebarToggleBtn);

    shadowRoot.appendChild(this.toolbarEl);
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

  private setViewport(viewport: Viewport) {
    this.currentViewport = viewport;
    this.viewportBtns.forEach((btn, i) => {
      btn.className = VIEWPORTS[i].key === viewport ? "active" : "";
    });
    this.onViewportChange(viewport);
  }

  setMode(mode: ToolbarMode) {
    this.mode = mode;
    this.browseBtn.className = mode === "browse" ? "active" : "";
    this.annotateBtn.className = mode === "annotate" ? "active" : "";
    this.measureBtn.className = mode === "measure" ? "active" : "";
    this.onModeChange(mode);
  }

  setCommentCount(count: number) {
    this.commentCountEl.textContent = String(count);
  }

  getMode(): ToolbarMode { return this.mode; }
  getViewport(): Viewport { return this.currentViewport; }
  destroy() { this.toolbarEl.remove(); this.topBarEl.remove(); }
}
