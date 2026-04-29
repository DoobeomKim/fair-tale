'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';

interface ConnectionManagerProps {
  pin: string;
  onConnectionStateChange: (state: {
    isConnected: boolean;
    socket: any;
    webrtcStatus: any;
  }) => void;
  onJoinSuccess: (data: any) => void;
  onJoinError: (error: { message: string }) => void;
  onTranscription: (data: { text: string }) => void;
}

export function ConnectionManager({
  pin,
  onConnectionStateChange,
  onJoinSuccess,
  onJoinError,
  onTranscription
}: ConnectionManagerProps) {
  const { socket, isConnected, connect, disconnect, on, emit } = useSocket();
  const {
    localStream,
    remoteStream,
    transcription,
    status,
    startConnection,
    cleanup
  } = useWebRTC(socket, pin);

  const isInitializedRef = useRef(false);
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);
  
  // 이전 상태를 저장하여 실제 변경 시에만 알림
  const previousStateRef = useRef<{
    isConnected: boolean;
    socketId: string | null;
    webrtcStatus: any;
  }>({
    isConnected: false,
    socketId: null,
    webrtcStatus: null
  });

  // 정리 함수 등록
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);

  // 모든 정리 함수 실행
  const executeCleanup = useCallback(() => {
    console.log('🧹 ConnectionManager 정리 시작...');
    cleanupFunctionsRef.current.forEach((cleanupFn, index) => {
      try {
        cleanupFn();
        console.log(`✅ 정리 함수 ${index + 1} 완료`);
      } catch (error) {
        console.error(`❌ 정리 함수 ${index + 1} 실패:`, error);
      }
    });
    cleanupFunctionsRef.current = [];
    console.log('✨ ConnectionManager 정리 완료');
  }, []);

  // 1. 연결 상태 모니터링 - 실제 상태 변경 시에만 알림
  useEffect(() => {
    const currentState = {
      isConnected,
      socketId: socket?.id || null,
      webrtcStatus: status
    };

    const previousState = previousStateRef.current;

    // 실제 상태 변경이 있을 때만 처리
    const hasStateChanged = 
      currentState.isConnected !== previousState.isConnected ||
      currentState.socketId !== previousState.socketId ||
      JSON.stringify(currentState.webrtcStatus) !== JSON.stringify(previousState.webrtcStatus);

    if (hasStateChanged) {
      console.log('🔍 연결 상태 실제 변경 감지:', {
        이전: previousState,
        현재: currentState
      });
      
      // 상태 변경 알림
      onConnectionStateChange({
        isConnected: currentState.isConnected,
        socket,
        webrtcStatus: currentState.webrtcStatus
      });

      // 이전 상태 업데이트
      previousStateRef.current = currentState;
    }
  }, [isConnected, socket?.id, status]); // onConnectionStateChange 제거

  // 2. 소켓 이벤트 리스너 관리 - 소켓 연결 시 이벤트 리스너 등록
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⏳ 소켓 연결 대기 중...');
      return;
    }

    console.log('🔗 소켓 이벤트 리스너 등록 중...');
    
    // 이벤트 리스너 등록
    on('join-room-success', onJoinSuccess);
    on('join-room-error', onJoinError);
    on('transcription', onTranscription);
    
    // 정리 함수 등록
    const cleanup = () => {
      console.log('🔗 소켓 이벤트 리스너 정리');
      // 실제 정리는 useSocket 내부에서 처리됨
    };
    registerCleanup(cleanup);
    
    return cleanup;
  }, [socket, isConnected, on, onJoinSuccess, onJoinError, onTranscription, registerCleanup]);

  // 3. 브라우저 이벤트 관리 - 페이지 종료/새로고침 시 정리
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('🚪 페이지 종료 감지 - 빠른 정리 시작');
      
      if (cleanup) cleanup();
      if (isConnected) {
        emit('leave-room', { roomId: pin });
        disconnect();
      }
      
      event.preventDefault();
      event.returnValue = '';
    };

    const handlePageHide = () => {
      console.log('📱 페이지 숨김 감지 - 빠른 정리 시작');
      
      if (cleanup) cleanup();
      if (isConnected) {
        emit('leave-room', { roomId: pin });
        disconnect();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('👁️ 페이지 가시성 변경 - 숨김');
      } else {
        console.log('👁️ 페이지 가시성 변경 - 표시');
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 정리 함수 등록
    const cleanup = () => {
      console.log('🌐 브라우저 이벤트 리스너 정리');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    registerCleanup(cleanup);
    
    return cleanup;
  }, [cleanup, disconnect, emit, isConnected, pin, registerCleanup]);

  // 4. 초기화 상태 관리 - 컴포넌트 마운트/언마운트 추적
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log('🚀 ConnectionManager 초기화 완료');
      isInitializedRef.current = true;
    }

    // 언마운트 시 정리
    return () => {
      console.log('🔄 ConnectionManager 언마운트 감지');
      executeCleanup();
      isInitializedRef.current = false;
    };
  }, [executeCleanup]);

  // 5. PIN 변경 감지 - PIN이 변경되면 기존 연결 정리
  useEffect(() => {
    console.log('📍 PIN 변경 감지:', pin);
    
    // PIN이 변경되면 기존 연결 상태를 정리해야 할 수 있음
    // 하지만 현재는 페이지 단위로 관리되므로 특별한 처리 불필요
  }, [pin]);

  // 연결 관리 함수들을 반환
  return {
    // 소켓 관련
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
    
    // WebRTC 관련
    localStream,
    remoteStream,
    transcription,
    status,
    startConnection,
    cleanup: () => {
      executeCleanup();
      if (cleanup) cleanup();
    }
  };
} 