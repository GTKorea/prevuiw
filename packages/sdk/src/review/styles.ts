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

  .prevuiw-toolbar {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(28,28,30,0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 6px 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
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
    color: rgba(255,255,255,0.4);
    font-family: inherit;
    margin-left: 2px;
  }

  .prevuiw-toolbar button:hover { background: rgba(255,255,255,0.08); }
  .prevuiw-toolbar button.active { background: rgba(255,255,255,0.12); }
  .prevuiw-toolbar button.active:hover { background: rgba(255,255,255,0.16); }
  .prevuiw-toolbar button.icon-toggle { padding: 6px 8px; }
  .prevuiw-toolbar button.icon-toggle.active { background: transparent; color: inherit; }
  .prevuiw-toolbar button.icon-toggle:not(.active) { opacity: 0.4; }

  .prevuiw-toolbar .divider {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.1);
    flex-shrink: 0;
  }

  .prevuiw-toolbar .status {
    font-size: 12px;
    color: #888;
    padding: 0 8px;
  }

  .prevuiw-pin {
    position: absolute;
    pointer-events: auto;
    width: 28px;
    height: 28px;
    border-radius: 50% 50% 50% 0;
    background: #e5e5e5;
    border: 2px solid rgba(0,0,0,0.2);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transform: rotate(-45deg) translate(-50%, -50%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #1a1a1a;
    transition: transform 0.15s;
  }

  .prevuiw-pin span { transform: rotate(45deg); }
  .prevuiw-pin:hover { transform: rotate(-45deg) translate(-50%, -50%) scale(1.15); }
  .prevuiw-pin.warn { background: #f59e0b; color: #1a1a1a; }

  .prevuiw-cursor {
    position: absolute;
    pointer-events: none;
    transition: left 0.1s linear, top 0.1s linear;
    z-index: 5;
  }

  .prevuiw-cursor-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .prevuiw-cursor-name {
    position: absolute;
    left: 12px;
    top: -4px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    color: #fff;
    white-space: nowrap;
  }

  .prevuiw-highlight {
    position: fixed;
    pointer-events: none;
    border: 2px solid rgba(229,229,229,0.6);
    border-radius: 4px;
    background: rgba(229,229,229,0.08);
    z-index: 1;
    transition: all 0.05s;
  }

  .prevuiw-comment-input {
    position: absolute;
    pointer-events: auto;
    background: #2c2c2e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
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
  .prevuiw-comment-input .btn-submit { background: #e5e5e5; color: #1a1a1a; }
  .prevuiw-comment-input .btn-submit:hover { background: #fff; }

  .prevuiw-popover {
    position: absolute;
    pointer-events: auto;
    background: #2c2c2e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    padding: 12px;
    width: 280px;
    z-index: 20;
    max-height: 300px;
    overflow-y: auto;
    color: #e5e5e5;
  }

  .prevuiw-popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .prevuiw-popover-author {
    font-weight: 600;
    font-size: 13px;
    color: #e5e5e5;
  }

  .prevuiw-popover-time {
    font-size: 11px;
    color: #666;
  }

  .prevuiw-popover-content {
    font-size: 13px;
    line-height: 1.5;
    color: #ccc;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .prevuiw-popover-close {
    all: unset;
    cursor: pointer;
    font-size: 16px;
    color: #666;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .prevuiw-popover-close:hover { background: rgba(255,255,255,0.08); color: #e5e5e5; }

  .prevuiw-reactions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }

  .prevuiw-reaction-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 11px;
    color: #ccc;
  }

  .prevuiw-popover-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .prevuiw-popover-actions .resolve-btn {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    color: #888;
    transition: background 0.15s;
  }

  .prevuiw-popover-actions .resolve-btn:hover { background: rgba(255,255,255,0.08); }

  .prevuiw-emoji-picker {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 4px;
    display: flex;
    gap: 2px;
    background: #2c2c2e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    z-index: 50;
  }

  .prevuiw-emoji-picker button {
    all: unset;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    font-size: 14px;
    transition: background 0.1s;
  }

  .prevuiw-emoji-picker button:hover { background: rgba(255,255,255,0.1); }
  .prevuiw-popover-actions .resolve-btn.resolved { color: #10b981; }

  .prevuiw-replies {
    margin-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 8px;
  }

  .prevuiw-reply {
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .prevuiw-reply:last-child { border-bottom: none; }

  .prevuiw-reply-author {
    font-size: 12px;
    font-weight: 600;
    color: #ccc;
  }

  .prevuiw-reply-time {
    font-size: 10px;
    color: #666;
  }

  .prevuiw-reply-content {
    font-size: 12px;
    line-height: 1.4;
    color: #aaa;
    margin-top: 2px;
  }

  .prevuiw-reply-input {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    align-items: flex-end;
  }

  .prevuiw-reply-input input {
    all: unset;
    flex: 1;
    padding: 6px 10px;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    font-size: 12px;
    background: #1c1c1e;
    color: #e5e5e5;
  }

  .prevuiw-reply-input input:focus {
    border-color: rgba(255,255,255,0.4);
  }

  .prevuiw-reply-input button {
    all: unset;
    cursor: pointer;
    padding: 6px 10px;
    background: #e5e5e5;
    color: #1a1a1a;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .prevuiw-reply-input button:hover { background: #fff; }

  .prevuiw-name-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    z-index: 30;
  }

  .prevuiw-name-card {
    background: #2c2c2e;
    border-radius: 16px;
    padding: 32px;
    width: 360px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    text-align: center;
    color: #e5e5e5;
  }

  .prevuiw-name-card h2 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
    color: #e5e5e5;
  }

  .prevuiw-name-card p {
    font-size: 13px;
    color: #888;
    margin-bottom: 20px;
  }

  .prevuiw-name-card input {
    all: unset;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    margin-bottom: 16px;
    text-align: left;
    background: #1c1c1e;
    color: #e5e5e5;
  }

  .prevuiw-name-card input:focus {
    border-color: rgba(255,255,255,0.4);
    box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
  }

  .prevuiw-name-card .btn-start {
    all: unset;
    cursor: pointer;
    width: 100%;
    padding: 10px;
    background: #e5e5e5;
    color: #1a1a1a;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    box-sizing: border-box;
    display: block;
    text-align: center;
  }

  .prevuiw-name-card .btn-start:hover { background: #fff; }

  .prevuiw-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background: rgba(28,28,30,0.97);
    backdrop-filter: blur(16px);
    border-left: 1px solid rgba(255,255,255,0.1);
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    z-index: 25;
  }

  .prevuiw-sidebar.open { transform: translateX(0); }

  .prevuiw-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .prevuiw-sidebar-close {
    all: unset;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: #888;
    display: flex;
  }

  .prevuiw-sidebar-close:hover { background: rgba(255,255,255,0.08); color: #e5e5e5; }

  .prevuiw-sidebar-tabs {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .prevuiw-sidebar-tabs button {
    all: unset;
    cursor: pointer;
    flex: 1;
    text-align: center;
    padding: 8px 0;
    font-size: 11px;
    font-weight: 500;
    color: #666;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }

  .prevuiw-sidebar-tabs button:hover { color: #ccc; }
  .prevuiw-sidebar-tabs button.active { color: #e5e5e5; border-bottom-color: #e5e5e5; }

  .prevuiw-sidebar-list {
    flex: 1;
    overflow-y: auto;
  }

  .prevuiw-sidebar-empty {
    padding: 40px 16px;
    text-align: center;
    font-size: 12px;
    color: #666;
  }

  .prevuiw-sidebar-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    transition: background 0.15s;
  }

  .prevuiw-sidebar-item:hover { background: rgba(255,255,255,0.04); }

  .prevuiw-sidebar-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #e5e5e5;
    color: #1a1a1a;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .prevuiw-sidebar-content {
    flex: 1;
    min-width: 0;
  }

  .prevuiw-sidebar-meta {
    font-size: 11px;
    color: #888;
    margin-bottom: 3px;
  }

  .prevuiw-sidebar-text {
    font-size: 12px;
    color: #ccc;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .prevuiw-sidebar-replies {
    font-size: 10px;
    color: #666;
    margin-top: 4px;
  }

  .prevuiw-sidebar-reactions {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 4px;
  }

  .prevuiw-sidebar-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-top: 6px;
  }

  .prevuiw-sidebar-actions button {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 6px;
    border-radius: 4px;
    color: #888;
    transition: background 0.15s;
  }

  .prevuiw-sidebar-actions button:hover { background: rgba(255,255,255,0.08); }
  .prevuiw-sidebar-actions button.resolved { color: #10b981; }

  .prevuiw-sidebar-reply-wrap {
    display: flex;
    gap: 6px;
    margin-top: 6px;
    align-items: center;
  }

  .prevuiw-sidebar-reply-input {
    all: unset;
    flex: 1;
    padding: 5px 8px;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    font-size: 11px;
    background: #1c1c1e;
    color: #e5e5e5;
  }

  .prevuiw-sidebar-reply-input:focus { border-color: rgba(255,255,255,0.4); }

  .prevuiw-sidebar-reply-send {
    all: unset;
    cursor: pointer;
    padding: 5px 8px;
    background: #e5e5e5;
    color: #1a1a1a;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
  }

  .prevuiw-sidebar-reply-send:hover { background: #fff; }

  .prevuiw-sidebar-replies-list {
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .prevuiw-sidebar-reply-item {
    padding: 4px 0;
    font-size: 11px;
  }

  .prevuiw-sidebar-resolved {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    flex-shrink: 0;
    margin-top: 6px;
  }

  .prevuiw-offline {
    position: fixed;
    top: 12px;
    right: 12px;
    pointer-events: auto;
    background: rgba(255,193,7,0.1);
    border: 1px solid rgba(255,193,7,0.3);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: #ffc107;
    z-index: 15;
  }
`;
