require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { processAudioStream } = require('./lib/speechToText');
const { translateText } = require('./lib/translation');
const { textToSpeech, createAudioDataUrl } = require('./lib/textToSpeech');

const app = express();
const httpServer = createServer(app);

// Socket.IO 설정 - 더 관대한 설정으로 변경
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 10000,
  connectTimeout: 20000,
  allowEIO3: true
});

// Express CORS 설정
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST'],
  credentials: false
}));

// 기본 라우트 핸들러
app.get('/', (req, res) => {
  res.send('Fair-Tale Signaling Server is running');
});

// 룸 상태 관리
const rooms = new Map();
const userRooms = new Map();
const VALID_PIN = '0707';
const MAX_PARTICIPANTS = 2;

// 룸 정리 함수
const cleanupRoom = (roomId, socketId) => {
  const room = rooms.get(roomId);
  if (!room) return;

  room.delete(socketId);
  userRooms.delete(socketId);

  if (room.size === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted - no users remaining`);
  } else {
    rooms.set(roomId, room);
    io.to(roomId).emit('room-status', {
      users: Array.from(room),
      count: room.size
    });
    console.log(`User ${socketId} removed from room ${roomId}. ${room.size} users remaining`);
  }
};

// Socket.IO 연결 처리 - 가장 단순하게
io.on('connection', (socket) => {
  console.log('🔗 NEW CONNECTION ESTABLISHED!');
  console.log('Socket ID:', socket.id);
  console.log('Query:', socket.handshake.query);
      
  // 연결 해제 처리
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      cleanupRoom(roomId, socket.id);
    }
  });

  // 방 입장 처리
  socket.on('join-room', (data) => {
    console.log('Join room request:', data);
    const { roomId, pin } = data;
    
    if (pin !== VALID_PIN) {
      socket.emit('join-room-error', { message: '잘못된 PIN입니다.' });
      return;
    }

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId);
    if (room.size >= MAX_PARTICIPANTS) {
      socket.emit('join-room-error', { message: '방이 가득 찼습니다.' });
      return;
    }

    room.add(socket.id);
    userRooms.set(socket.id, roomId);
    socket.join(roomId);

    console.log(`User ${socket.id} joined room ${roomId}`);
    
    socket.emit('join-room-success', {
      roomId,
      users: Array.from(room),
      count: room.size
    });

    socket.to(roomId).emit('room-status', {
      users: Array.from(room),
      count: room.size
    });
  });

  // 방 나가기 처리
  socket.on('leave-room', (data) => {
    const { roomId } = data;
    if (roomId && userRooms.get(socket.id) === roomId) {
      cleanupRoom(roomId, socket.id);
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    }
  });

  // 음성 데이터 처리 (STT → 번역 → TTS 파이프라인)
  socket.on('audio-data', async (data) => {
    console.log('🎤 음성 데이터 수신:', {
      socketId: socket.id,
      roomId: data.roomId,
      audioDataSize: data.audioData ? data.audioData.length : 0,
      language: data.language,
      timestamp: new Date().toISOString()
    });

    const { roomId, audioData, language } = data;
    
    if (userRooms.get(socket.id) !== roomId) {
      console.log('❌ 룸 불일치:', { userRoom: userRooms.get(socket.id), requestedRoom: roomId });
      socket.emit('error', {
        code: 'ROOM_MISMATCH',
        message: 'User not in the specified room'
      });
      return;
    }

    try {
      const startTime = Date.now();
      
      console.log('🔄 STT 처리 시작...');
      // 1단계: STT (음성 → 텍스트)
      const audioBuffer = Buffer.from(audioData, 'base64');
      console.log('📊 오디오 버퍼 크기:', audioBuffer.length, 'bytes');
      
      const transcriptionResults = await processAudioStream(audioBuffer, language);
      
      // 무의미한 STT 결과 필터링 (완화된 버전)
      if (!Array.isArray(transcriptionResults) || transcriptionResults.length === 0) {
        return; // 로그 제거
      }
      
      // 유효한 transcript가 있는지 확인 (조건 완화)
      const validResults = transcriptionResults.filter(result => {
        const hasTranscript = result && result.transcript && typeof result.transcript === 'string';
        const isNotEmpty = hasTranscript && result.transcript.trim().length > 0;
        const isNotUndefined = hasTranscript && result.transcript !== 'undefined';
        
        return hasTranscript && isNotEmpty && isNotUndefined;
      });
      
      if (validResults.length === 0) {
        return; // 로그 제거
      }
      
      const originalText = validResults[0].transcript;
      console.log('🎤 STT 성공:', originalText);
      
      // 2단계: 번역 (텍스트 → 번역된 텍스트)
      const translationResult = await translateText(originalText, language);
      const translatedText = translationResult.translatedText;
      
      console.log('🌐 번역 완료:', {
        원문: originalText,
        번역: translatedText,
        시간: `${Date.now() - startTime}ms`
      });
      
      // 3단계: TTS (번역된 텍스트 → 음성)
      console.log('🔊 TTS 처리 시작...');
      const ttsTime = Date.now();
      const ttsResult = await textToSpeech(translatedText, 'EN');
      const ttsEndTime = Date.now();
      
      if (ttsResult.error) {
        throw new Error(`TTS 변환 실패: ${ttsResult.error}`);
      }
      
      // 오디오 Data URL 생성
      const audioDataUrl = createAudioDataUrl(ttsResult.audioContent, 'MP3');
      
      console.log('✅ TTS 변환 완료:', {
        text: translatedText.substring(0, 20) + '...',
        audioSize: ttsResult.audioContent ? ttsResult.audioContent.length : 0,
        timeTaken: `${ttsEndTime - ttsTime}ms`
      });
      
      // 전체 파이프라인 완료 로그
      const totalTime = Date.now() - startTime;
      const sttTime = ttsTime - startTime;
      const translationTime = ttsTime - startTime;
      const actualTtsTime = ttsEndTime - ttsTime;
      
      console.log('🎉 전체 파이프라인 완료:', {
        totalTime: `${totalTime}ms`,
        sttTime: `${sttTime}ms`, 
        translationTime: `${translationTime}ms`,
        ttsTime: `${actualTtsTime}ms`,
        targetUnder1300ms: totalTime <= 1300 ? '✅' : '❌'
      });
      
      // 번역 결과를 방의 모든 사용자에게 전송 (자막용)
      io.to(roomId).emit('transcription', {
        originalText,
        translatedText,
        userId: socket.id,
        timestamp: Date.now()
      });
      
      console.log('📡 번역 결과 전송:', {
        originalText: originalText.substring(0, 20) + '...',
        translatedText: translatedText.substring(0, 20) + '...',
        roomId
      });
      
      // TTS 음성을 방의 모든 사용자에게 전송 (테스트용: 자신 포함)
      // 실제 운영에서는 socket.to(roomId)를 사용하여 다른 사용자에게만 전송
      io.to(roomId).emit('tts-audio', {
        originalText,
        translatedText,
        audioDataUrl,
        userId: socket.id,
        timestamp: Date.now()
      });
      
      console.log('📡 TTS 음성 전송:', {
        originalText: originalText.substring(0, 20) + '...',
        translatedText: translatedText.substring(0, 20) + '...',
        audioSize: audioDataUrl ? audioDataUrl.length : 0,
        roomId,
        target: 'ALL_USERS_INCLUDING_SELF (테스트용)'
      });
      
    } catch (error) {
      console.error('❌ 음성 처리 파이프라인 오류:', error.message);
      socket.emit('error', {
        code: 'PROCESSING_ERROR',
        message: 'Audio processing failed'
      });
    }
  });
});

// 서버 시작
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO server initialized');
});

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 