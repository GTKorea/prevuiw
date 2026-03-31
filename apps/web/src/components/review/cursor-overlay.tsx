"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";

interface CursorData {
  name: string;
  color: string;
  x: number;
  y: number;
}

interface CursorOverlayProps {
  socketRef: React.RefObject<Socket | null>;
  userName: string;
  /** The element to track mousemove on (the main content area wrapping the iframe) */
  trackRef: React.RefObject<HTMLDivElement | null>;
}

export function CursorOverlay({
  socketRef,
  userName,
  trackRef,
}: CursorOverlayProps) {
  const cursorsRef = useRef<Map<string, CursorData>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const lastSentRef = useRef({ x: -1, y: -1 });
  const joinedRef = useRef(false);

  // Render cursors via direct DOM manipulation for performance
  const renderCursors = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const existing = new Set<string>();
    cursorsRef.current.forEach((cursor, socketId) => {
      existing.add(socketId);
      let el = container.querySelector(
        `[data-cursor-id="${socketId}"]`
      ) as HTMLDivElement | null;

      if (!el) {
        el = document.createElement("div");
        el.setAttribute("data-cursor-id", socketId);
        el.style.position = "absolute";
        el.style.pointerEvents = "none";
        el.style.zIndex = "50";
        el.style.transition = "left 80ms linear, top 80ms linear";
        el.innerHTML = `
          <div style="width:10px;height:10px;border-radius:50%;background:${cursor.color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>
          <div style="margin-top:2px;margin-left:6px;padding:1px 6px;border-radius:4px;background:${cursor.color};color:white;font-size:11px;line-height:16px;font-weight:500;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${cursor.name}</div>
        `;
        container.appendChild(el);
      }

      el.style.left = `${cursor.x}%`;
      el.style.top = `${cursor.y}%`;
    });

    // Remove stale cursor elements
    container.querySelectorAll("[data-cursor-id]").forEach((el) => {
      const id = el.getAttribute("data-cursor-id")!;
      if (!existing.has(id)) {
        el.remove();
      }
    });
  }, []);

  // Socket event listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Join cursor tracking
    if (!joinedRef.current) {
      socket.emit("cursor:join", { name: userName });
      joinedRef.current = true;
    }

    function onCursorJoin(data: {
      socketId: string;
      name: string;
      color: string;
    }) {
      cursorsRef.current.set(data.socketId, {
        name: data.name,
        color: data.color,
        x: -10,
        y: -10,
      });
    }

    function onCursorExisting(
      users: Array<{ socketId: string; name: string; color: string }>
    ) {
      for (const u of users) {
        cursorsRef.current.set(u.socketId, {
          name: u.name,
          color: u.color,
          x: -10,
          y: -10,
        });
      }
    }

    function onCursorMove(data: { socketId: string; x: number; y: number }) {
      const cursor = cursorsRef.current.get(data.socketId);
      if (cursor) {
        cursor.x = data.x;
        cursor.y = data.y;
      }
      renderCursors();
    }

    function onCursorLeave(data: { socketId: string }) {
      cursorsRef.current.delete(data.socketId);
      renderCursors();
    }

    socket.on("cursor:join", onCursorJoin);
    socket.on("cursor:existing", onCursorExisting);
    socket.on("cursor:move", onCursorMove);
    socket.on("cursor:leave", onCursorLeave);

    return () => {
      socket.off("cursor:join", onCursorJoin);
      socket.off("cursor:existing", onCursorExisting);
      socket.off("cursor:move", onCursorMove);
      socket.off("cursor:leave", onCursorLeave);
      joinedRef.current = false;
    };
  }, [socketRef, userName, renderCursors]);

  // Attach mousemove listener to the tracking element
  useEffect(() => {
    const trackEl = trackRef.current;
    const socket = socketRef.current;
    if (!trackEl || !socket) return;

    function onMouseMove(e: MouseEvent) {
      const rect = trackEl!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Skip if position hasn't changed meaningfully
      if (
        Math.abs(x - lastSentRef.current.x) < 0.3 &&
        Math.abs(y - lastSentRef.current.y) < 0.3
      ) {
        return;
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          const socket = socketRef.current;
          if (socket) {
            socket.emit("cursor:move", {
              x: lastSentRef.current.x,
              y: lastSentRef.current.y,
            });
          }
        });
      }
      lastSentRef.current = { x, y };
    }

    trackEl.addEventListener("mousemove", onMouseMove);
    return () => {
      trackEl.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackRef, socketRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-none"
    />
  );
}
