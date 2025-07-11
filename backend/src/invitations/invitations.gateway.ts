import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'https://ddukddak.org',
      'https://www.ddukddak.org',
      'https://pagecube.net',
      'https://www.pagecube.net',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
  },
  namespace: '/invite',
})
export class InvitationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // userId와 socketId 매핑
  private userSocketMap: Map<number, string> = new Map();

  handleConnection(client: Socket) {
    // 클라이언트가 userId를 쿼리로 보낸 경우
    const userId = client.handshake.query.userId;
    if (userId) {
      this.userSocketMap.set(Number(userId), client.id);
    }
  }

  handleDisconnect(client: Socket) {
    // 연결 해제 시 매핑 제거
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        break;
      }
    }
  }

  // 특정 userId에게 실시간 초대 알림 전송
  sendInvitationToUser(userId: number, invitationData: any) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new-invitation', invitationData);
    }
  }
}
