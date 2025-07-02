require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// CORS 설정을 위한 클라이언트 URL 설정
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const VERCEL_URL = process.env.VERCEL_URL || 'https://fair-tale.vercel.app';

const io = new Server(httpServer, {
  cors: {
    origin: [VERCEL_URL, CLIENT_URL],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Express CORS 설정
app.use(cors({
  origin: [VERCEL_URL, CLIENT_URL],
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 룸 상태 관리
const rooms = new Map();
const VALID_PIN = '0707'; // 유효한 PIN 설정
const MAX_PARTICIPANTS = 2; // 최대 참가자 수 설정

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // 룸 참가 요청 처리
  socket.on('join-room', async (pin) => {
    try {
      // PIN 검증
      if (pin !== VALID_PIN) {
        socket.emit('error', 'Invalid PIN');
        return;
      }

      // 룸이 존재하지 않으면 생성
      if (!rooms.has(pin)) {
        rooms.set(pin, new Set());
      }

      const room = rooms.get(pin);

      // 2명 초과 입장 제한
      if (room.size >= MAX_PARTICIPANTS) {
        socket.emit('room-full');
        return;
      }

      // 룸에 참가
      await socket.join(pin);
      room.add(socket.id);

      // 룸 정보 전송
      socket.emit('room-joined', {
        roomId: pin,
        participants: room.size
      });

      // 다른 참가자들에게 새 참가자 알림
      socket.to(pin).emit('user-joined', {
        userId: socket.id,
        participants: room.size
      });

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  // 룸 퇴장 처리
  socket.on('leave-room', async (pin) => {
    try {
      await socket.leave(pin);
      const room = rooms.get(pin);
      
      if (room) {
        room.delete(socket.id);
        
        // 룸이 비어있으면 삭제
        if (room.size === 0) {
          rooms.delete(pin);
        } else {
          // 남은 참가자들에게 퇴장 알림
          socket.to(pin).emit('user-left', {
            userId: socket.id,
            participants: room.size
          });
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // 연결 해제 처리
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // 모든 룸에서 해당 사용자 제거
    for (const [pin, room] of rooms.entries()) {
      if (room.has(socket.id)) {
        room.delete(socket.id);
        
        if (room.size === 0) {
          rooms.delete(pin);
        } else {
          socket.to(pin).emit('user-left', {
            userId: socket.id,
            participants: room.size
          });
        }
      }
    }
  });
});

// 서버 시작
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 