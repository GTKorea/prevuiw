import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { SdkService } from './sdk.service';

interface CursorData {
  x: number;
  y: number;
  name: string;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/sdk-review',
})
export class SdkReviewGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: any;

  private presence = new Map<
    string,
    Map<string, { name: string; lastMove: number }>
  >();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private sdkService: SdkService) {
    this.cleanupInterval = setInterval(() => this.cleanStaleCursors(), 10000);
  }

  async handleConnection(client: any) {
    const key = client.handshake.query.projectKey as string;
    const versionId = client.handshake.query.versionId as string;
    const inviteToken = client.handshake.query.inviteToken as string;
    const reviewerName =
      (client.handshake.query.name as string) || 'Anonymous';

    if (!key || !versionId) {
      client.disconnect();
      return;
    }

    const project = await this.sdkService.validateKey(key);
    if (!project) {
      client.disconnect();
      return;
    }

    // Validate invite token if provided
    if (inviteToken) {
      const versionKey = client.handshake.query.versionKey as string;
      if (versionKey) {
        const tokenValid = await this.sdkService.validateInviteToken(versionKey, inviteToken);
        if (!tokenValid) {
          client.disconnect();
          return;
        }
      }
    }

    const room = `sdk:${versionId}`;
    client.join(room);
    client.data = { versionId, name: reviewerName, projectId: project.id };

    if (!this.presence.has(versionId)) {
      this.presence.set(versionId, new Map());
    }
    this.presence
      .get(versionId)!
      .set(client.id, { name: reviewerName, lastMove: Date.now() });

    client.to(room).emit('cursor:join', {
      socketId: client.id,
      name: reviewerName,
    });

    const users = Array.from(this.presence.get(versionId)!.entries())
      .filter(([id]) => id !== client.id)
      .map(([id, data]) => ({ socketId: id, name: data.name }));
    client.emit('cursor:presence', users);
  }

  handleDisconnect(client: any) {
    const versionId = client.data?.versionId;
    if (!versionId) return;

    const room = `sdk:${versionId}`;
    const versionPresence = this.presence.get(versionId);
    if (versionPresence) {
      versionPresence.delete(client.id);
      if (versionPresence.size === 0) this.presence.delete(versionId);
    }

    this.server.to(room).emit('cursor:leave', { socketId: client.id });
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() client: any,
    @MessageBody() data: CursorData,
  ) {
    const versionId = client.data?.versionId;
    if (!versionId) return;

    const versionPresence = this.presence.get(versionId);
    if (versionPresence?.has(client.id)) {
      versionPresence.get(client.id)!.lastMove = Date.now();
    }

    client.to(`sdk:${versionId}`).volatile.emit('cursor:move', {
      socketId: client.id,
      name: data.name || client.data?.name,
      x: data.x,
      y: data.y,
    });
  }

  private cleanStaleCursors() {
    const now = Date.now();
    for (const [versionId, users] of this.presence) {
      for (const [socketId, data] of users) {
        if (now - data.lastMove > 30000) {
          users.delete(socketId);
          this.server
            .to(`sdk:${versionId}`)
            .emit('cursor:leave', { socketId });
        }
      }
      if (users.size === 0) this.presence.delete(versionId);
    }
  }

  emitNewComment(versionId: string, comment: any) {
    this.server.to(`sdk:${versionId}`).emit('newComment', comment);
  }
}
