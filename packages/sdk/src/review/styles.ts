export const SDK_STYLES = `
  :host {
    all: initial;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    height: max(100%, var(--prevuiw-doc-height, 100vh));
    z-index: 2147483647;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #e5e5e5;
  }

  /* ─── Top Bar (viewport + user) ─── */
  .prevuiw-topbar {
    position: fixed;
    top: 12px;
    left: 12px;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10;
  }

  .prevuiw-topbar-group {
    display: flex;
    align-items: center;
    gap: 2px;
    background: rgba(9,9,11,0.92);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 3px;
  }

  .prevuiw-topbar-group button {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    transition: all 0.15s;
    white-space: nowrap;
  }

  .prevuiw-topbar-group button span { font-size: 11px; }
  .prevuiw-topbar-group button:hover { color: #e5e5e5; background: rgba(255,255,255,0.06); }
  .prevuiw-topbar-group button.active { color: #e5e5e5; background: rgba(255,255,255,0.1); }

  .prevuiw-topbar-user {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(9,9,11,0.92);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
  }

  .prevuiw-topbar-user span { font-size: 11px; }

  /* ─── Bottom Toolbar ─── */
  .prevuiw-toolbar {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(9,9,11,0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 6px 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    color: #e5e5e5;
    z-index: 10;
  }

  .prevuiw-toolbar button {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    transition: background 0.15s;
    white-space: nowrap;
  }

  .prevuiw-toolbar button svg { flex-shrink: 0; }
  .prevuiw-toolbar button span { font-size: 12px; }
  .prevuiw-toolbar button kbd {
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    font-family: inherit;
    margin-left: 2px;
  }

  .prevuiw-toolbar button:hover { background: rgba(255,255,255,0.08); }
  .prevuiw-toolbar button.active { background: rgba(255,255,255,0.12); }
  .prevuiw-toolbar button.active:hover { background: rgba(255,255,255,0.16); }
  .prevuiw-toolbar button.icon-toggle { padding: 6px 8px; }
  .prevuiw-toolbar button.icon-toggle.active { background: transparent; color: inherit; }
  .prevuiw-toolbar button.icon-toggle:not(.active) { opacity: 0.4; }

  .prevuiw-toolbar .comment-count {
    font-size: 11px;
    margin-left: 2px;
  }

  .prevuiw-toolbar .divider {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  /* ─── Pin ─── */
  .prevuiw-pin {
    position: absolute;
    pointer-events: auto;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #3b82f6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    transform: translate(-50%, -50%);
    transition: transform 0.15s, box-shadow 0.15s;
    z-index: 10;
  }

  .prevuiw-pin:hover { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 3px 12px rgba(0,0,0,0.4); }
  .prevuiw-pin.resolved { background: #10b981; }
  .prevuiw-pin.warn { background: #f59e0b; }

  /* ─── Element Highlight (on pin hover/click) — below pins ─── */
  .prevuiw-element-highlight {
    position: absolute;
    pointer-events: none;
    border: 2px solid #3b82f6;
    border-radius: 4px;
    background: rgba(59,130,246,0.06);
    z-index: -1;
    transition: all 0.15s;
  }

  /* ─── Cursor ─── */
  .prevuiw-cursor {
    position: absolute;
    pointer-events: none;
    transition: left 80ms linear, top 80ms linear;
    z-index: 5;
  }

  .prevuiw-cursor-arrow {
    line-height: 0;
  }

  .prevuiw-cursor-name {
    position: absolute;
    left: 14px;
    top: 14px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }

  /* ─── Element Picker Highlight ─── */
  .prevuiw-highlight {
    position: fixed;
    pointer-events: none;
    border: 2px solid #3b82f6;
    border-radius: 4px;
    background: rgba(59,130,246,0.08);
    z-index: 1;
    transition: all 0.05s;
  }

  /* ─── Comment Input ─── */
  .prevuiw-comment-input {
    position: absolute;
    pointer-events: auto;
    background: rgba(9,9,11,0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    padding: 12px;
    width: 280px;
    z-index: 20;
  }

  .prevuiw-comment-input textarea {
    all: unset;
    width: 100%;
    min-height: 60px;
    font-size: 13px;
    line-height: 1.4;
    display: block;
    box-sizing: border-box;
    color: #e5e5e5;
  }

  .prevuiw-comment-input .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .prevuiw-comment-input button {
    all: unset;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .prevuiw-comment-input .btn-cancel { color: #888; }
  .prevuiw-comment-input .btn-cancel:hover { background: rgba(255,255,255,0.08); }
  .prevuiw-comment-input .btn-submit { background: #3b82f6; color: #fff; }
  .prevuiw-comment-input .btn-submit:hover { background: #2563eb; }

  /* ─── Popover ─── */
  .prevuiw-popover {
    position: absolute;
    pointer-events: auto;
    background: rgba(9,9,11,0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    padding: 12px;
    width: 280px;
    z-index: 20;
    max-height: 400px;
    overflow: visible;
    color: #e5e5e5;
  }

  .prevuiw-popover-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .prevuiw-popover-author { font-weight: 600; font-size: 13px; color: #e5e5e5; }
  .prevuiw-popover-time { font-size: 11px; color: #555; }
  .prevuiw-popover-content { font-size: 13px; line-height: 1.5; color: #ccc; white-space: pre-wrap; word-break: break-word; }
  .prevuiw-popover-close { all: unset; cursor: pointer; font-size: 16px; color: #555; padding: 2px 6px; border-radius: 4px; line-height: 1; }
  .prevuiw-popover-close:hover { background: rgba(255,255,255,0.08); color: #e5e5e5; }

  /* ─── Reactions ─── */
  .prevuiw-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
  .prevuiw-reaction-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #ccc; cursor: pointer; transition: background 0.1s; }
  .prevuiw-reaction-badge:hover { background: rgba(255,255,255,0.06); }

  /* ─── Popover Actions ─── */
  .prevuiw-popover-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); }
  .prevuiw-popover-actions .resolve-btn { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 11px; color: #888; transition: background 0.15s; }
  .prevuiw-popover-actions .resolve-btn:hover { background: rgba(255,255,255,0.08); }
  .prevuiw-popover-actions .resolve-btn.resolved { color: #10b981; }

  /* ─── Emoji Picker ─── */
  .prevuiw-emoji-picker { position: absolute; bottom: 100%; left: 0; margin-bottom: 4px; display: flex; gap: 2px; background: rgba(9,9,11,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 50; }
  .prevuiw-emoji-picker button { all: unset; cursor: pointer; padding: 6px; border-radius: 6px; font-size: 20px; transition: background 0.1s; }
  .prevuiw-emoji-picker button:hover { background: rgba(255,255,255,0.08); }

  /* ─── Replies ─── */
  .prevuiw-replies { margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; }
  .prevuiw-reply { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .prevuiw-reply:last-child { border-bottom: none; }
  .prevuiw-reply-author { font-size: 12px; font-weight: 600; color: #ccc; }
  .prevuiw-reply-time { font-size: 10px; color: #555; }
  .prevuiw-reply-content { font-size: 12px; line-height: 1.4; color: #aaa; margin-top: 2px; }

  /* ─── Reply Input ─── */
  .prevuiw-reply-input { display: flex; gap: 6px; margin-top: 8px; align-items: flex-end; }
  .prevuiw-reply-input input { all: unset; flex: 1; padding: 6px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; background: rgba(0,0,0,0.3); color: #e5e5e5; }
  .prevuiw-reply-input input:focus { border-color: rgba(255,255,255,0.3); }
  .prevuiw-reply-input button { all: unset; cursor: pointer; padding: 6px 10px; background: #3b82f6; color: #fff; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .prevuiw-reply-input button:hover { background: #2563eb; }

  /* ─── Name Overlay ─── */
  .prevuiw-name-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; pointer-events: auto; z-index: 30; }
  .prevuiw-name-card { background: rgba(9,9,11,0.97); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; width: 360px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); text-align: center; color: #e5e5e5; }
  .prevuiw-name-card h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: #e5e5e5; }
  .prevuiw-name-card p { font-size: 13px; color: #888; margin-bottom: 20px; }
  .prevuiw-name-card input { all: unset; width: 100%; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 16px; text-align: left; background: rgba(0,0,0,0.3); color: #e5e5e5; }
  .prevuiw-name-card input:focus { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
  .prevuiw-name-card .btn-start { all: unset; cursor: pointer; width: 100%; padding: 10px; background: #3b82f6; color: #fff; border-radius: 8px; font-size: 14px; font-weight: 600; box-sizing: border-box; display: block; text-align: center; }
  .prevuiw-name-card .btn-start:hover { background: #2563eb; }

  .prevuiw-name-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: #555; font-size: 12px; }
  .prevuiw-name-divider::before, .prevuiw-name-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }

  .prevuiw-name-card .btn-google {
    all: unset; cursor: pointer; width: 100%; padding: 10px; background: #fff; color: #1a1a1a;
    border-radius: 8px; font-size: 14px; font-weight: 500; box-sizing: border-box;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .prevuiw-name-card .btn-google:hover { background: #f5f5f5; }
  .prevuiw-name-card .btn-google svg { flex-shrink: 0; }

  /* ─── Sidebar (push content, resizable) ─── */
  .prevuiw-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    background: rgba(9,9,11,0.97);
    backdrop-filter: blur(16px);
    border-left: 1px solid rgba(255,255,255,0.06);
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.2s ease;
    z-index: 25;
  }

  .prevuiw-sidebar.open { transform: translateX(0); }

  .prevuiw-sidebar-resize {
    position: absolute;
    top: 0;
    left: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 1;
  }

  .prevuiw-sidebar-resize:hover,
  .prevuiw-sidebar-resize:active {
    background: rgba(59,130,246,0.3);
  }

  .prevuiw-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .prevuiw-sidebar-title-wrap { display: flex; align-items: center; gap: 6px; }
  .prevuiw-sidebar-title { font-size: 14px; font-weight: 600; color: #e5e5e5; margin: 0; }
  .prevuiw-sidebar-count { font-size: 12px; color: #666; }

  .prevuiw-sidebar-close {
    all: unset;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: #888;
    display: flex;
    transition: background 0.15s;
  }

  .prevuiw-sidebar-close:hover { background: rgba(255,255,255,0.08); color: #e5e5e5; }

  .prevuiw-sidebar-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .prevuiw-sidebar-tabs button {
    all: unset;
    cursor: pointer;
    flex: 1;
    text-align: center;
    padding: 8px 0;
    font-size: 12px;
    font-weight: 500;
    color: #555;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }
  .prevuiw-sidebar-tabs button:hover { color: #ccc; }
  .prevuiw-sidebar-tabs button.active { color: #e5e5e5; border-bottom-color: #e5e5e5; }

  .prevuiw-sidebar-list { flex: 1; overflow-y: auto; }
  .prevuiw-sidebar-empty { padding: 48px 16px; text-align: center; font-size: 13px; color: #555; }

  .prevuiw-sidebar-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    transition: background 0.15s;
  }

  .prevuiw-sidebar-item:hover { background: rgba(255,255,255,0.03); }

  .prevuiw-sidebar-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .prevuiw-sidebar-num.resolved { background: #10b981; }

  .prevuiw-sidebar-content { flex: 1; min-width: 0; }

  .prevuiw-sidebar-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .prevuiw-sidebar-author { font-size: 13px; font-weight: 500; color: #e5e5e5; }
  .prevuiw-sidebar-time { font-size: 12px; color: #555; margin-left: auto; }

  .prevuiw-sidebar-text {
    font-size: 13px;
    color: #ccc;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .prevuiw-sidebar-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }

  .prevuiw-sidebar-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
  }

  .prevuiw-sidebar-actions button {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    color: #888;
    font-size: 12px;
    transition: background 0.15s;
  }

  .prevuiw-sidebar-actions button:hover { background: rgba(255,255,255,0.06); }
  .prevuiw-sidebar-actions button svg { transform: rotate(-8deg); }
  .prevuiw-sidebar-actions button.resolve-action svg { transform: none; }
  .prevuiw-sidebar-actions button.resolve-action.resolved { color: #10b981; }

  .prevuiw-emoji-wrap { position: relative; display: inline-flex; }

  .prevuiw-sidebar .prevuiw-emoji-picker { position: absolute; bottom: auto; top: 100%; left: auto; right: 0; margin-top: 4px; margin-bottom: 0; }

  .prevuiw-sidebar-reply-wrap { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
  .prevuiw-sidebar-reply-textarea {
    all: unset;
    width: 100%;
    min-height: 48px;
    padding: 8px 10px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.4;
    background: rgba(0,0,0,0.3);
    color: #e5e5e5;
    box-sizing: border-box;
    resize: vertical;
    display: block;
  }
  .prevuiw-sidebar-reply-textarea:focus { border-color: rgba(59,130,246,0.5); }
  .prevuiw-sidebar-reply-send { all: unset; cursor: pointer; padding: 6px 12px; background: #3b82f6; color: #fff; border-radius: 6px; font-size: 12px; font-weight: 600; align-self: flex-end; }
  .prevuiw-sidebar-reply-send:hover { background: #2563eb; }

  .prevuiw-sidebar-replies-list { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.04); }
  .prevuiw-sidebar-reply-item { padding: 6px 0; }
  .prevuiw-sidebar-reply-item + .prevuiw-sidebar-reply-item { border-top: 1px solid rgba(255,255,255,0.03); }
`;
