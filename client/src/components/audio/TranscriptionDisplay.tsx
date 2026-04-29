'use client';

import React, { useState, useEffect, useRef, memo } from 'react';

interface TranscriptionMessage {
  id: string;
  type: 'original' | 'translated';
  originalText?: string;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  confidence?: number;
  userId?: string;
  timestamp: string;
  isPlaying?: boolean;
}

interface TranscriptionDisplayProps {
  roomId: string;
  socket?: any;
  isConnected?: boolean;
}

function TranscriptionDisplayComponent({ roomId, socket, isConnected }: TranscriptionDisplayProps) {
  const mountedRef = useRef(false);
  
  // 컴포넌트 마운트 로그 (한 번만 출력)
  useEffect(() => {
    if (!mountedRef.current) {
      console.log('🎯 TranscriptionDisplay 컴포넌트 최초 마운트됨 - roomId:', roomId);
      mountedRef.current = true;
    }
    
    console.log('🎯 TranscriptionDisplay 소켓 상태:', {
      socket: !!socket,
      connected: isConnected,
      id: socket?.id
    });
  }, [roomId, socket?.id, isConnected]);

  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('🎯🎯🎯 TranscriptionDisplay 마운트 완료! roomId:', roomId);
    
    // 소켓 이벤트 리스너 설정
    if (!socket || !isConnected) {
      console.log('⚠️ TranscriptionDisplay: 소켓이 없거나 연결되지 않음', {
        hasSocket: !!socket,
        isConnected,
        socketId: socket?.id
      });
      return;
    }

    console.log('🔌 TranscriptionDisplay 이벤트 리스너 설정 완료 - 소켓 ID:', socket.id);



    // 번역 결과 수신 (서버에서 transcription 이벤트로 변경됨)
    const handleTranscriptionResult = (data: any) => {
      console.log('🌐 번역 자막 수신 (transcription):', {
        originalText: data.originalText,
        translatedText: data.translatedText,
        userId: data.userId,
        timestamp: data.timestamp
      });

      // 원본 메시지 추가
      const originalMessage: TranscriptionMessage = {
        id: `original-${Date.now()}-${Math.random()}`,
        type: 'original',
        originalText: data.originalText,
        sourceLanguage: 'ko-KR',
        confidence: 0.95,
        userId: data.userId,
        timestamp: data.timestamp || new Date().toISOString()
      };

      // 번역 메시지 추가
      const translatedMessage: TranscriptionMessage = {
        id: `translated-${Date.now()}-${Math.random()}`,
        type: 'translated',
        originalText: data.originalText,
        translatedText: data.translatedText,
        sourceLanguage: 'ko-KR',
        targetLanguage: 'en-US',
        confidence: 0.95,
        userId: data.userId,
        timestamp: data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, originalMessage, translatedMessage]);
    };

    // TTS 음성 수신 (서버에서 tts-audio 이벤트로 변경됨)
    const handleTtsAudio = (data: any) => {
      console.log('🔊 TTS 음성 수신:', {
        originalText: data.originalText,
        translatedText: data.translatedText,
        audioDataUrl: data.audioDataUrl,
        audioSize: data.audioDataUrl?.length,
        hasAudioDataUrl: !!data.audioDataUrl,
        userId: data.userId
      });

      // 테스트용: 자신의 TTS도 재생 허용 (운영에서는 다시 활성화)
      // if (data.userId === socket?.id) {
      //   console.log('⏭️ 내가 보낸 메시지의 TTS는 재생하지 않음');
      //   return;
      // }

      if (data.audioDataUrl) {
        playTranslatedAudio(data.audioDataUrl, data.translatedText);
      } else {
        console.warn('⚠️ TTS 음성 데이터가 없습니다:', data);
      }
    };

    // 이벤트 리스너 등록 - 서버와 맞춤
    socket.on('transcription', handleTranscriptionResult);
    socket.on('tts-audio', handleTtsAudio);

    // 정리 함수
    return () => {
      console.log('🔄 TranscriptionDisplay 이벤트 리스너 정리');
      
      // Socket.IO의 off 메서드 직접 사용
      if (socket?.off) {
        socket.off('transcription', handleTranscriptionResult);
        socket.off('tts-audio', handleTtsAudio);
      }
      
      // 현재 재생 중인 오디오 정지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [socket?.id, roomId, isConnected]);

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 번역된 음성 재생 함수
  const playTranslatedAudio = async (audioBase64: string, text: string) => {
    try {
      console.log('🔊 번역된 음성 재생 시작:', text);
      setIsPlaying(true);

      // 기존 오디오 정지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // 새 오디오 요소 생성
      const audio = new Audio(audioBase64);
      audioRef.current = audio;

      // 재생 완료 이벤트
      audio.addEventListener('ended', () => {
        console.log('✅ 음성 재생 완료');
        setIsPlaying(false);
        audioRef.current = null;
      });

      // 재생 시작
      await audio.play();
      
    } catch (error) {
      console.error('❌ 음성 재생 실패:', error);
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  // 메시지 그룹핑 함수 (연속된 같은 사용자의 메시지)
  const groupMessages = (messages: TranscriptionMessage[]) => {
    const groups: TranscriptionMessage[][] = [];
    let currentGroup: TranscriptionMessage[] = [];

    messages.forEach(message => {
      if (currentGroup.length === 0 || 
          (currentGroup[0].userId === message.userId && 
           currentGroup[0].type === message.type)) {
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [message];
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const messageGroups = groupMessages(messages);

  return (
    <div className="h-96 flex flex-col">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messageGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            음성 인식 및 번역 결과가 여기에 표시됩니다.
            <br />
            마이크를 활성화하고 말해보세요! 🎤
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => {
            const firstMessage = group[0];
            const isMyMessage = firstMessage.userId === socket?.id;
            
            return (
              <div
                key={groupIndex}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] space-y-1`}>
                  {group.map((message, messageIndex) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        isMyMessage
                          ? message.type === 'original'
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-400 text-white'
                          : message.type === 'original'
                            ? 'bg-gray-300 text-gray-900'
                            : 'bg-gray-400 text-white'
                      }`}
                    >
                      <div className="text-sm">
                        {message.type === 'original' 
                          ? message.originalText 
                          : message.translatedText}
                      </div>
                      
                      <div className="text-xs opacity-75 mt-1 flex justify-between items-center">
                        <span>
                          {message.type === 'original' ? '원문' : '번역'} • 
                          {message.sourceLanguage && ` ${message.sourceLanguage}`}
                          {message.targetLanguage && ` → ${message.targetLanguage}`} • 
                          신뢰도: {Math.round((message.confidence || 0) * 100)}%
                        </span>
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 상태 표시 영역 */}
      <div className="p-2 bg-white border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-600">
            {isConnected ? '연결됨' : '연결 끊김'}
          </span>
        </div>
        
        {isPlaying && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            번역 음성 재생 중...
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          총 {messages.length}개 메시지
        </div>
      </div>
    </div>
  );
}

export const TranscriptionDisplay = memo(TranscriptionDisplayComponent); 