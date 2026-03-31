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
    color: #1a1a1a;
  }

  .prevuiw-toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
  }

  .prevuiw-toolbar button {
    all: unset;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.15s;
  }

  .prevuiw-toolbar button:hover { background: #f5f5f5; }
  .prevuiw-toolbar button.active { background: #3b82f6; color: #fff; }
  .prevuiw-toolbar button.active:hover { background: #2563eb; }
  .prevuiw-toolbar button.icon-toggle { font-size: 15px; padding: 6px 8px; }
  .prevuiw-toolbar button.icon-toggle.active { background: transparent; color: inherit; }
  .prevuiw-toolbar button.icon-toggle:not(.active) { opacity: 0.4; }

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
    background: #3b82f6;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transform: rotate(-45deg) translate(-50%, -50%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    transition: transform 0.15s;
  }

  .prevuiw-pin span { transform: rotate(45deg); }
  .prevuiw-pin:hover { transform: rotate(-45deg) translate(-50%, -50%) scale(1.15); }
  .prevuiw-pin.warn { background: #f59e0b; }

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
    border: 2px solid #3b82f6;
    border-radius: 4px;
    background: rgba(59, 130, 246, 0.08);
    z-index: 1;
    transition: all 0.05s;
  }

  .prevuiw-comment-input {
    position: absolute;
    pointer-events: auto;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
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

  .prevuiw-comment-input .btn-cancel { color: #666; }
  .prevuiw-comment-input .btn-cancel:hover { background: #f5f5f5; }
  .prevuiw-comment-input .btn-submit { background: #3b82f6; color: #fff; }
  .prevuiw-comment-input .btn-submit:hover { background: #2563eb; }

  .prevuiw-popover {
    position: absolute;
    pointer-events: auto;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    padding: 12px;
    width: 280px;
    z-index: 20;
    max-height: 300px;
    overflow-y: auto;
  }

  .prevuiw-popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .prevuiw-popover-author {
    font-weight: 600;
    font-size: 13px;
  }

  .prevuiw-popover-time {
    font-size: 11px;
    color: #999;
  }

  .prevuiw-popover-content {
    font-size: 13px;
    line-height: 1.5;
    color: #333;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .prevuiw-popover-close {
    all: unset;
    cursor: pointer;
    font-size: 16px;
    color: #999;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .prevuiw-popover-close:hover { background: #f5f5f5; color: #333; }

  .prevuiw-offline {
    position: fixed;
    top: 12px;
    right: 12px;
    pointer-events: auto;
    background: #fef3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: #856404;
    z-index: 15;
  }
`;
