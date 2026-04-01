"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Comment } from "@/hooks/use-comments";
import { useCommentStore, IframeScroll } from "@/stores/comment-store";
import { CommentPin } from "./comment-pin";
import { CommentInput } from "./comment-input";

/** Convert viewport-relative % to document-relative % using iframe scroll info */
function viewportToDoc(
  vx: number,
  vy: number,
  s: IframeScroll
): { x: number; y: number } {
  const docX = (vx / 100) * s.clientWidth + s.scrollX;
  const docY = (vy / 100) * s.clientHeight + s.scrollY;
  return {
    x: (docX / s.scrollWidth) * 100,
    y: (docY / s.scrollHeight) * 100,
  };
}

/** Convert document-relative % back to viewport-relative % */
function docToViewport(
  dx: number,
  dy: number,
  s: IframeScroll
): { x: number; y: number } {
  const docX = (dx / 100) * s.scrollWidth;
  const docY = (dy / 100) * s.scrollHeight;
  return {
    x: ((docX - s.scrollX) / s.clientWidth) * 100,
    y: ((docY - s.scrollY) / s.clientHeight) * 100,
  };
}

function isInViewport(vx: number, vy: number): boolean {
  return vx >= -5 && vx <= 105 && vy >= -5 && vy <= 105;
}

interface PendingComment {
  viewX: number;
  viewY: number;
  posX: number;
  posY: number;
  cssSelector?: string;
  selectionArea?: { x: number; y: number; width: number; height: number };
  viewSelectionArea?: { x: number; y: number; width: number; height: number };
}

interface CommentOverlayProps {
  comments: Comment[];
  onCreateComment: (data: {
    content: string;
    posX: number;
    posY: number;
    cssSelector?: string;
    selectionArea?: { x: number; y: number; width: number; height: number };
    pageUrl?: string;
  }) => void;
  isCreating?: boolean;
}

export function CommentOverlay({
  comments,
  onCreateComment,
  isCreating,
}: CommentOverlayProps) {
  const { mode, setMode, pinsVisible, iframePageUrl, modifierHeld, setModifierHeld, sdkDetected } = useCommentStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<PendingComment | null>(null);
  const [dragRect, setDragRect] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  const modifierDraggingRef = useRef(false);
  const dragDataRef = useRef<{
    start: { x: number; y: number };
    current: { x: number; y: number };
  } | null>(null);

  // Scroll state from iframe SDK.
  // scrollRef always has the latest value (for click handlers).
  // scroll (state) is only set after scrollHeight stabilizes (no flickering).
  const [scroll, setScroll] = useState<IframeScroll | null>(null);
  const scrollRef = useRef<IframeScroll | null>(null);
  const stabilizedRef = useRef(false);

  // Filter top-level comments by current page URL
  const topLevelComments = useMemo(
    () =>
      comments.filter((c) => {
        if (c.parentId) return false;
        if (iframePageUrl && c.pageUrl) {
          return c.pageUrl === iframePageUrl;
        }
        return true;
      }),
    [comments, iframePageUrl]
  );

  // Modifier key (Cmd/Ctrl) listener for shortcut comment placement
  useEffect(() => {
    if (!sdkDetected) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Meta" || e.key === "Control") {
        if (!pending) setModifierHeld(true);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "Meta" || e.key === "Control") {
        if (!modifierDraggingRef.current) setModifierHeld(false);
      }
    }
    function onBlur() {
      if (!modifierDraggingRef.current) setModifierHeld(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
    };
  }, [setModifierHeld, pending, sdkDetected]);

  // Send picker commands to iframe when mode changes
  useEffect(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentWindow) return;

    if (mode === "commenting" && sdkDetected) {
      iframe.contentWindow.postMessage({ type: "prevuiw:startPicker" }, "*");
    } else {
      iframe.contentWindow.postMessage({ type: "prevuiw:stopPicker" }, "*");
    }
  }, [mode, sdkDetected]);

  // Listen for element picks from iframe SDK
  useEffect(() => {
    function handleElementPicked(e: MessageEvent) {
      if (e.data?.type !== "prevuiw:elementPicked") return;
      const { selector, posX, posY, viewX, viewY, pageUrl } = e.data;
      setPending({
        viewX,
        viewY,
        posX,
        posY,
        cssSelector: selector || undefined,
      });

      // Stop picker after pick
      const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
      iframe?.contentWindow?.postMessage({ type: "prevuiw:stopPicker" }, "*");
    }

    window.addEventListener("message", handleElementPicked);
    return () => window.removeEventListener("message", handleElementPicked);
  }, []);

  // "V" key to switch to browse/idle mode
  useEffect(() => {
    function onVKey(e: KeyboardEvent) {
      if ((e.key === "v" || e.key === "V") && !e.metaKey && !e.ctrlKey) {
        setMode("idle");
      }
    }
    window.addEventListener("keydown", onVKey);
    return () => window.removeEventListener("keydown", onVKey);
  }, [setMode]);

  // Reclaim focus from iframe
  useEffect(() => {
    function onWindowBlur() {
      requestAnimationFrame(() => {
        if (document.activeElement?.tagName === "IFRAME") window.focus();
      });
    }
    window.addEventListener("blur", onWindowBlur);
    return () => window.removeEventListener("blur", onWindowBlur);
  }, []);

  // Listen to scroll messages from iframe SDK.
  // Before stabilized: collect data silently, only render once scrollHeight
  // stays the same for 2 consecutive checks (600ms of no dimension change).
  // After stabilized: update state immediately on every scroll for smooth tracking.
  useEffect(() => {
    let rafId = 0;
    let lastH = 0;
    let lastW = 0;
    let stableCount = 0;
    let checkTimer: ReturnType<typeof setInterval> | null = null;

    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "prevuiw:scroll") {
        scrollRef.current = {
          scrollX: e.data.scrollX,
          scrollY: e.data.scrollY,
          scrollWidth: e.data.scrollWidth,
          scrollHeight: e.data.scrollHeight,
          clientWidth: e.data.clientWidth,
          clientHeight: e.data.clientHeight,
        };

        if (stabilizedRef.current) {
          // Already stable — update immediately for smooth scroll tracking
          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              rafId = 0;
              setScroll(scrollRef.current);
            });
          }
        }
        // Before stable: just store in ref, the interval check will promote to state
      }
    }

    // Wait at least 2s after first scroll message, then check if
    // scrollHeight has been stable for 1s (4 consecutive identical checks).
    let firstMessageAt = 0;

    checkTimer = setInterval(() => {
      if (stabilizedRef.current) {
        if (checkTimer) clearInterval(checkTimer);
        return;
      }
      const s = scrollRef.current;
      if (!s) return;

      if (!firstMessageAt) firstMessageAt = Date.now();

      // Don't even start checking until 1s after first message
      if (Date.now() - firstMessageAt < 1000) return;

      if (s.scrollHeight === lastH && s.scrollWidth === lastW && s.scrollHeight > 0) {
        stableCount++;
      } else {
        stableCount = 0;
        lastH = s.scrollHeight;
        lastW = s.scrollWidth;
      }

      // Stable for 2 checks = 600ms of no dimension change
      if (stableCount >= 2) {
        stabilizedRef.current = true;
        setScroll(scrollRef.current);
        if (checkTimer) clearInterval(checkTimer);
      }
    }, 300);

    // Hard fallback: after 6s, show whatever we have
    const fallback = setTimeout(() => {
      if (!stabilizedRef.current && scrollRef.current) {
        stabilizedRef.current = true;
        setScroll(scrollRef.current);
      }
      if (checkTimer) clearInterval(checkTimer);
    }, 6000);

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (rafId) cancelAnimationFrame(rafId);
      if (checkTimer) clearInterval(checkTimer);
      clearTimeout(fallback);
    };
  }, []);

  // Compute visible pins with viewport coordinates.
  // scroll === null means no SDK data yet → show nothing.
  // As scroll updates arrive (SDK polling), pins reposition automatically.
  const visiblePins = useMemo(() => {
    if (!scroll) return [];

    return topLevelComments
      .map((comment, i) => {
        const sa = comment.selectionArea;
        const docX = sa ? sa.x + sa.width : comment.posX;
        const docY = sa ? sa.y + sa.height : comment.posY;

        const vp = docToViewport(docX, docY, scroll);
        let vpArea: typeof sa = null;

        if (sa) {
          const tl = docToViewport(sa.x, sa.y, scroll);
          const br = docToViewport(sa.x + sa.width, sa.y + sa.height, scroll);
          vpArea = {
            x: tl.x,
            y: tl.y,
            width: br.x - tl.x,
            height: br.y - tl.y,
          };
        }

        if (!isInViewport(vp.x, vp.y)) return null;

        return { comment, index: i, vpX: vp.x, vpY: vp.y, vpArea };
      })
      .filter(Boolean) as Array<{
      comment: Comment;
      index: number;
      vpX: number;
      vpY: number;
      vpArea: Comment["selectionArea"];
    }>;
  }, [topLevelComments, scroll]);

  const getPercentPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!overlayRef.current) return { x: 0, y: 0 };
      const rect = overlayRef.current.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      };
    },
    []
  );

  // When SDK is detected and in commenting mode, let iframe handle the picking
  // (overlay should not capture mouse events — iframe picker does it via postMessage)
  const iframePicking = mode === "commenting" && sdkDetected && !pending;
  const isActive = (mode === "commenting" && !iframePicking) || modifierHeld;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (pending) return;
      const hasModifier = e.metaKey || e.ctrlKey;
      const canAct = mode === "commenting" || (hasModifier && mode === "idle");
      if (!canAct) return;
      e.preventDefault();
      const start = getPercentPosition(e.clientX, e.clientY);
      dragDataRef.current = { start, current: start };
      setDragRect({ x: start.x, y: start.y, width: 0, height: 0 });
      if (hasModifier && mode === "idle") modifierDraggingRef.current = true;
    },
    [mode, getPercentPosition, pending]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragDataRef.current) return;
      const pos = getPercentPosition(e.clientX, e.clientY);
      dragDataRef.current.current = pos;
      const { start } = dragDataRef.current;
      setDragRect({
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      });
    },
    [getPercentPosition]
  );

  const handleMouseUp = useCallback(
    () => {
      const data = dragDataRef.current;
      if (!data) return;
      const { start, current } = data;
      const vw = Math.abs(current.x - start.x);
      const vh = Math.abs(current.y - start.y);

      if (vw > 1 && vh > 1) {
        const vx = Math.min(start.x, current.x);
        const vy = Math.min(start.y, current.y);
        const centerVx = vx + vw / 2;
        const centerVy = vy + vh / 2;
        const viewArea = { x: vx, y: vy, width: vw, height: vh };
        const s = scrollRef.current;
        if (s) {
          const topLeft = viewportToDoc(vx, vy, s);
          const bottomRight = viewportToDoc(vx + vw, vy + vh, s);
          const center = viewportToDoc(centerVx, centerVy, s);
          setPending({
            viewX: centerVx, viewY: centerVy,
            posX: center.x, posY: center.y,
            selectionArea: { x: topLeft.x, y: topLeft.y, width: bottomRight.x - topLeft.x, height: bottomRight.y - topLeft.y },
            viewSelectionArea: viewArea,
          });
        } else {
          setPending({
            viewX: centerVx, viewY: centerVy,
            posX: centerVx, posY: centerVy,
            selectionArea: viewArea,
            viewSelectionArea: viewArea,
          });
        }
      } else {
        const s = scrollRef.current;
        const doc = s ? viewportToDoc(start.x, start.y, s) : { x: start.x, y: start.y };
        setPending({ viewX: start.x, viewY: start.y, posX: doc.x, posY: doc.y });
      }

      dragDataRef.current = null;
      setDragRect(null);
      modifierDraggingRef.current = false;
      setModifierHeld(false);
    },
    [setModifierHeld]
  );

  const handleSubmitComment = (content: string) => {
    if (!pending) return;
    onCreateComment({
      content,
      posX: pending.posX,
      posY: pending.posY,
      cssSelector: pending.cssSelector,
      selectionArea: pending.selectionArea,
      pageUrl: iframePageUrl ?? undefined,
    });
    setPending(null);
    setMode("idle");
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10"
      style={{
        pointerEvents: isActive ? "auto" : "none",
        cursor: isActive ? "crosshair" : undefined,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Loading state while waiting for page dimensions to stabilize */}
      {!scroll && sdkDetected && pinsVisible && comments.length > 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-popover/95 backdrop-blur-md px-8 py-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="size-8 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading comment pins</p>
              <p className="text-xs text-muted-foreground mt-0.5">Waiting for page to finish rendering...</p>
            </div>
          </div>
        </div>
      )}

      {/* Pins with fade-in animation */}
      {pinsVisible && scroll && (
        <div className="animate-in fade-in duration-500">
          {visiblePins.map(({ comment, index, vpX, vpY, vpArea }) => (
            <CommentPin
              key={comment.id}
              id={comment.id}
              index={index}
              posX={vpX}
              posY={vpY}
              isResolved={comment.isResolved}
              content={comment.content}
              authorName={comment.author?.name ?? comment.guestName ?? "Guest"}
              selectionArea={vpArea}
            />
          ))}
        </div>
      )}

      {dragRect && dragRect.width > 0 && dragRect.height > 0 && (
        <div
          className="absolute border-2 border-dashed border-yellow-500/60 bg-yellow-500/10 rounded-sm"
          style={{ left: `${dragRect.x}%`, top: `${dragRect.y}%`, width: `${dragRect.width}%`, height: `${dragRect.height}%`, pointerEvents: "none" }}
        />
      )}

      {pending?.viewSelectionArea && (
        <div
          className="absolute border-2 border-dashed border-yellow-500/60 bg-yellow-500/10 rounded-sm"
          style={{ left: `${pending.viewSelectionArea.x}%`, top: `${pending.viewSelectionArea.y}%`, width: `${pending.viewSelectionArea.width}%`, height: `${pending.viewSelectionArea.height}%`, pointerEvents: "none" }}
        />
      )}

      {pending && (
        <div
          className="absolute z-20 w-80"
          style={{ left: `${pending.viewX}%`, top: `${pending.viewY}%`, transform: "translate(8px, 8px)", pointerEvents: "auto" }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
            <CommentInput
              onSubmit={handleSubmitComment}
              onCancel={() => { setPending(null); setMode("idle"); }}
              placeholder="Leave a comment..."
              autoFocus
              isLoading={isCreating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
