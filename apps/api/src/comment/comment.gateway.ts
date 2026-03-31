import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/comments',
})
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: any;

  // Map of versionId -> Set of socketIds
  private versionRooms = new Map<string, Set<string>>();
  // Map of socketId -> cursor user info
  private cursorUsers = new Map<string, { name: string; color: string }>();

  private static CURSOR_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  ];

  private pickColor(): string {
    const usedColors = new Set(
      [...this.cursorUsers.values()].map((u) => u.color),
    );
    const available = CommentGateway.CURSOR_COLORS.find(
      (c) => !usedColors.has(c),
    );
    return (
      available ||
      CommentGateway.CURSOR_COLORS[
        this.cursorUsers.size % CommentGateway.CURSOR_COLORS.length
      ]
    );
  }

  handleConnection(client: any) {
    const versionId = client.handshake.query.versionId as string;
    if (!versionId) return;

    const roomName = `version:${versionId}`;
    client.join(roomName);

    if (!this.versionRooms.has(versionId)) {
      this.versionRooms.set(versionId, new Set());
    }
    this.versionRooms.get(versionId)!.add(client.id);

    const count = this.versionRooms.get(versionId)!.size;
    this.server.to(roomName).emit('onlineCount', { versionId, count });
  }

  handleDisconnect(client: any) {
    const versionId = client.handshake.query.versionId as string;
    if (!versionId) return;

    const roomName = `version:${versionId}`;
    const room = this.versionRooms.get(versionId);
    if (room) {
      room.delete(client.id);
      const count = room.size;
      this.server.to(roomName).emit('onlineCount', { versionId, count });
      if (count === 0) {
        this.versionRooms.delete(versionId);
      }
    }

    // Notify others that cursor left
    if (this.cursorUsers.has(client.id)) {
      this.cursorUsers.delete(client.id);
      client.to(roomName).emit('cursor:leave', { socketId: client.id });
    }
  }

  @SubscribeMessage('cursor:join')
  handleCursorJoin(client: any, payload: { name: string }) {
    const versionId = client.handshake.query.versionId as string;
    if (!versionId) return;

    const color = this.pickColor();
    this.cursorUsers.set(client.id, { name: payload.name, color });

    const roomName = `version:${versionId}`;
    // Broadcast to others
    client.to(roomName).emit('cursor:join', {
      socketId: client.id,
      name: payload.name,
      color,
    });

    // Send existing cursors to the newly joined client
    const existing: Array<{ socketId: string; name: string; color: string }> =
      [];
    const room = this.versionRooms.get(versionId);
    if (room) {
      for (const sid of room) {
        if (sid !== client.id && this.cursorUsers.has(sid)) {
          existing.push({ socketId: sid, ...this.cursorUsers.get(sid)! });
        }
      }
    }
    if (existing.length > 0) {
      client.emit('cursor:existing', existing);
    }
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    client: any,
    payload: { x: number; y: number },
  ) {
    const versionId = client.handshake.query.versionId as string;
    if (!versionId) return;

    const roomName = `version:${versionId}`;
    client.to(roomName).emit('cursor:move', {
      socketId: client.id,
      x: payload.x,
      y: payload.y,
    });
  }

  emitNewComment(versionId: string, comment: any) {
    this.server.to(`version:${versionId}`).emit('newComment', comment);
  }

  emitResolveComment(versionId: string, commentId: string, isResolved: boolean) {
    this.server
      .to(`version:${versionId}`)
      .emit('resolveComment', { commentId, isResolved });
  }

  emitDeleteComment(versionId: string, commentId: string) {
    this.server
      .to(`version:${versionId}`)
      .emit('deleteComment', { commentId });
  }
}
