import {
  WebSocketGateway,
  WebSocketServer,
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
