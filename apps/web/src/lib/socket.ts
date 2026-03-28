"use client";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3012";

export function createCommentSocket(versionId: string): Socket {
  return io(`${WS_URL}/comments`, {
    query: { versionId },
    transports: ["websocket"],
  });
}
