'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useRouting } from '@/hooks/useRouting';
import { useMeeting } from '@/contexts/MeetingContext';
import { MeetingLobby } from './MeetingLobby';
import { MeetingSpace } from './MeetingSpace';
import { ConnectionManager } from './ConnectionManager';

interface MeetingRoomProps {
  pin: string;
  myLanguage?: string;
}

// React.memo로 컴포넌트 메모이제이션
const MeetingRoom = memo(function MeetingRoom({ pin, myLanguage = 'ko-KR' }: MeetingRoomProps) {
  const { navigateToMeetingMain } = useRouting();
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const webrtcInitializedRef = useRef<boolean>(false); // WebRTC 중복 연결 방지 플래그
  
  // Context에서 상태와 액션들 가져오기
  const {
    state,
    setPin,
    setJoining,
    setJoined,
    setLeaving,
    setError,
    setConnectionState,
    setMediaStreams,
    setAudioEnabled,
    setVideoEnabled,
    setLeaveProgress
  } = useMeeting();

  // 재마운트 방지를 위한 상태 추적
  const [mountId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  console.log('🔄 MeetingRoom 렌더링 - mountId:', mountId, 'pin:', pin);

  // 연결 상태 변경 핸들러 - useCallback으로 메모이제이션하여 무한 루프 방지
  const handleConnectionStateChange = useCallback((connectionState: {
    isConnected: boolean;
    socket: any;
    webrtcStatus: any;
  }) => {
    setConnectionState(connectionState);
  }, [setConnectionState]);

  // 방 입장 성공 핸들러
  const handleJoinSuccess = useCallback((data: any) => {
    console.log('🎉 방 입장 성공:', data);
    setJoined(true);
    setJoining(false);
    setError(null);
    
    // 타임아웃 해제
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
  }, [setJoined, setJoining, setError]);

  // 방 입장 실패 핸들러
  const handleJoinError = useCallback((error: { message: string }) => {
    console.error('❌ 방 입장 실패:', error);
    setError(error.message);
    setJoining(false);
    
    // 타임아웃 해제
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
  }, [setError, setJoining]);

  // 자막 수신 핸들러 - TranscriptionDisplay에서 직접 처리하므로 여기서는 로깅만
  const handleTranscription = useCallback((data: { text: string }) => {
    console.log('📝 자막 수신:', data.text);
    // appendTranscription 제거 - TranscriptionDisplay에서 직접 소켓 이벤트 처리
  }, []);

  // ConnectionManager 초기화
  const connectionManager = ConnectionManager({
    pin: state.pin,
    onConnectionStateChange: handleConnectionStateChange,
    onJoinSuccess: handleJoinSuccess,
    onJoinError: handleJoinError,
    onTranscription: handleTranscription
  });

  // 1. PIN 초기화 및 변경 감지
  useEffect(() => {
    console.log('📍 PIN 설정:', pin);
    setPin(pin);
    
    // 컴포넌트 마운트 시 초기화
    webrtcInitializedRef.current = false;
    
    console.log('🚀 MeetingRoom 마운트 완료 - mountId:', mountId);
  }, [pin, setPin]);

  // 2. 컴포넌트 마운트/언마운트 추적
  useEffect(() => {
    console.log('🚀 MeetingRoom 마운트 완료 - mountId:', mountId);
    
    return () => {
      console.log('🔄 MeetingRoom 언마운트 - mountId:', mountId);
      
      // 타임아웃 정리
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
    };
  }, [mountId]);

  // 3. 미디어 스트림 상태 동기화
  useEffect(() => {
    if (connectionManager) {
      console.log('🎥 미디어 스트림 상태 업데이트:', {
        hasLocal: !!connectionManager.localStream,
        hasRemote: !!connectionManager.remoteStream
      });
      
      setMediaStreams({
        localStream: connectionManager.localStream,
        remoteStream: connectionManager.remoteStream
      });
    }
  }, [connectionManager?.localStream, connectionManager?.remoteStream, setMediaStreams]);

  // 4. WebRTC 연결 자동 시작 (방 입장 성공 후)
  useEffect(() => {
    if (state.isJoined && connectionManager?.startConnection && !webrtcInitializedRef.current) {
      console.log('🔗 방 입장 완료 - WebRTC 연결 시작...');
      
      // WebRTC 초기화 플래그 설정
      webrtcInitializedRef.current = true;
      
      // 약간의 지연을 두어 안정성 확보
      const timer = setTimeout(() => {
        if (connectionManager?.startConnection) {
          connectionManager.startConnection();
        }
      }, 500);
      
      return () => {
        clearTimeout(timer);
      };
    } else if (state.isJoined && webrtcInitializedRef.current) {
      console.log('🔄 WebRTC 이미 초기화됨 - 중복 시도 방지');
    }
  }, [state.isJoined, connectionManager]);

  // 5. 에러 상태 모니터링
  useEffect(() => {
    if (state.error) {
      console.error('❌ MeetingRoom 에러 상태:', state.error);
      
      // 에러 발생 시 로딩 상태 해제
      if (state.isJoining) {
        setJoining(false);
      }
    }
  }, [state.error, state.isJoining, setJoining]);

  // 방 입장 핸들러
  const handleJoinRoom = async () => {
    console.log('입장하기 버튼 클릭 - PIN:', state.pin);
    setError(null);
    setJoining(true);
    
    try {
      // 1. 소켓 연결 시도
      console.log('📶 소켓 연결 시도 중...');
      await connectionManager?.connect();
      
      console.log('✅ 소켓 연결 성공');

      // 2. 방 입장 응답 대기 타임아웃 설정
      joinTimeoutRef.current = setTimeout(() => {
        if (!state.isJoined) {
          console.error('⏰ 방 입장 응답 시간 초과');
          setError('방 입장 응답 시간이 초과되었습니다. 다시 시도해주세요.');
          setJoining(false);
          connectionManager?.disconnect();
        }
      }, 10000); // 10초 타임아웃
      
      // 3. 방 입장 요청 전송
      console.log('🚪 방 입장 요청 전송:', state.pin);
      connectionManager?.emit('join-room', { roomId: state.pin, pin: state.pin });
      
    } catch (err) {
      console.error('❌ 입장 중 오류 발생:', err);
      
      // 타임아웃 해제
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
      
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setJoining(false);
      connectionManager?.disconnect();
    }
  };

  // 방 나가기 핸들러
  const handleLeaveRoom = async () => {
    if (state.isLeaving) return;
    
    setLeaving(true);
    
    try {
      // 1단계: 미디어 스트림 정리 (카메라, 마이크 끄기)
      setLeaveProgress({
        step: '미디어 정리 중...',
        message: '카메라와 마이크를 종료하고 있습니다.',
        isComplete: false
      });
      
      console.log('🎥 미디어 스트림 정리 시작...');
      
      // ConnectionManager의 cleanup을 호출하여 WebRTC 미디어 스트림 정리
      if (connectionManager?.cleanup) {
        connectionManager.cleanup();
        console.log('✅ WebRTC 미디어 스트림 정리 완료');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2단계: 서버에 나가기 요청
      setLeaveProgress({
        step: '방에서 나가는 중...',
        message: '서버에 나가기 요청을 전송하고 있습니다.',
        isComplete: false
      });
      
      if (state.isConnected && connectionManager?.emit) {
        connectionManager.emit('leave-room', { roomId: state.pin });
        console.log('📤 방 나가기 요청 전송 완료');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3단계: 소켓 연결 정리
      setLeaveProgress({
        step: '연결 정리 중...',
        message: '소켓 연결을 정리하고 있습니다.',
        isComplete: false
      });
      
      if (connectionManager?.disconnect) {
        connectionManager.disconnect();
        console.log('🔌 소켓 연결 해제 완료');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 4단계: 권한 상태 초기화 (재진입 시 권한 재요청을 위해)
      setLeaveProgress({
        step: '권한 정리 중...',
        message: '미디어 권한 상태를 초기화하고 있습니다.',
        isComplete: false
      });
      
      // WebRTC 초기화 플래그 초기화 (재진입 시 WebRTC 재연결을 위해)
      webrtcInitializedRef.current = false;
      console.log('🔄 WebRTC 초기화 플래그 리셋 완료');
      
      // localStorage에서 권한 허용 상태 제거 (재진입 시 다시 권한 요청)
      try {
        localStorage.removeItem('media-permission-granted');
        localStorage.removeItem('media-permission-session');
        console.log('🔑 미디어 권한 상태 초기화 완료 - 재진입 시 권한 재요청됨');
      } catch (error) {
        console.warn('⚠️ 권한 상태 초기화 실패:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 5단계: 완료
      setLeaveProgress({
        step: '완료',
        message: '성공적으로 방에서 나갔습니다.',
        isComplete: true
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 메인 페이지로 이동
      console.log('🏠 메인 페이지로 이동');
      navigateToMeetingMain();
      
    } catch (error) {
      console.error('❌ 방 나가기 실패:', error);
      setError('방 나가기 중 오류가 발생했습니다.');
      setLeaving(false);
    }
  };

  // 오디오/비디오 토글 핸들러
  const handleToggleAudio = () => {
    setAudioEnabled(!state.isAudioEnabled);
    console.log('🎤 오디오 토글:', !state.isAudioEnabled);
  };

  const handleToggleVideo = () => {
    setVideoEnabled(!state.isVideoEnabled);
    console.log('📹 비디오 토글:', !state.isVideoEnabled);
  };

  // 자막 수신 핸들러 - TranscriptionDisplay에서 직접 처리
  const handleTranscriptionReceived = (text: string) => {
    console.log('음성 인식 결과:', text);
    // TranscriptionDisplay가 직접 소켓 이벤트를 처리하므로 여기서는 로깅만
  };

    return (
    <div className="min-h-screen bg-gray-100">
      {/* 방 입장 전 UI */}
      {!state.isJoined && (
        <MeetingLobby
          pin={state.pin}
          isJoining={state.isJoining}
          isConnected={state.isConnected}
          error={state.error}
          webrtcStatus={state.webrtcStatus ? {
            isInitialized: state.webrtcStatus.isInitialized,
            hasMedia: state.webrtcStatus.hasMedia,
            isPeerConnected: state.webrtcStatus.isPeerConnected,
            error: state.webrtcStatus.error ? { message: state.webrtcStatus.error.message } : undefined
          } : null}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {/* 방 입장 후 UI */}
      {state.isJoined && (
        <MeetingSpace
          pin={state.pin}
          isLeaving={state.isLeaving}
          transcription={state.transcription}
          localStream={state.localStream}
          remoteStream={state.remoteStream}
          isAudioEnabled={state.isAudioEnabled}
          isVideoEnabled={state.isVideoEnabled}
          leaveProgress={state.leaveProgress}
          myLanguage={myLanguage}
          socket={connectionManager?.socket}
          isConnected={state.isConnected}
          onLeaveRoom={handleLeaveRoom}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onTranscriptionReceived={handleTranscriptionReceived}
        />
      )}
    </div>
  );
});

export default MeetingRoom; 