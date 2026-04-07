import { io } from "socket.io-client";

type EventCallback = (...args: any[]) => void;

export class WsClient {
  private socket: any = null;
  private connected = false;
  private listeners = new Map<string, EventCallback[]>();
  private cursorRafId = 0;
  private pendingCursor: { x: number; y: number; name: string } | null = null;

  constructor(
    private apiUrl: string,
    private projectKey: string,
    private versionId: string,
    private reviewerName: string,
    private versionKey: string,
    private inviteToken: string,
  ) {}

  async connect() {
    this.socket = io(`${this.apiUrl}/sdk-review`, {
      query: {
        projectKey: this.projectKey,
        versionId: this.versionId,
        versionKey: this.versionKey,
        inviteToken: this.inviteToken,
        name: this.reviewerName,
      },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      this.connected = true;
      this.emit("_connected");
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("[prevuiw] WS disconnected:", reason);
      this.connected = false;
      this.emit("_disconnected");
    });

    this.socket.on("connect_error", (err: any) => {
      console.log("[prevuiw] WS connect_error:", err.message);
    });

    for (const event of ["cursor:move", "cursor:join", "cursor:leave", "cursor:presence", "newComment"]) {
      this.socket.on(event, (data: any) => this.emit(event, data));
    }
  }

  sendCursorMove(x: number, y: number) {
    this.pendingCursor = { x, y, name: this.reviewerName };
    if (this.cursorRafId) return;
    this.cursorRafId = requestAnimationFrame(() => {
      this.cursorRafId = 0;
      if (this.socket && this.connected && this.pendingCursor) {
        this.socket.volatile.emit("cursor:move", this.pendingCursor);
        this.pendingCursor = null;
      }
    });
  }

  on(event: string, cb: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  private emit(event: string, ...args: any[]) {
    const cbs = this.listeners.get(event);
    if (cbs) cbs.forEach((cb) => cb(...args));
  }

  disconnect() {
    if (this.cursorRafId) cancelAnimationFrame(this.cursorRafId);
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
    this.listeners.clear();
  }

  isConnected() { return this.connected; }
}
