import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

// WebRTC 설정 상수
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];

const PEER_CONNECTION_CONFIG = {
  iceServers: ICE_SERVERS,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 0
} as RTCConfiguration;

export interface WebRTCStatus {
  isInitialized: boolean;
  isConnecting: boolean;
  hasMedia: boolean;
  isPeerConnected: boolean;
  error: Error | null;
}

interface WebRTCState {
  isInitialized: boolean;
  isConnecting: boolean;
  hasLocalStream: boolean;
  hasRemoteStream: boolean;
  isConnected: boolean;
  error: Error | null;
}

export const useWebRTC = (socket: Socket | null, roomId?: string, onStatusChange?: (status: WebRTCStatus) => void) => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const roomIdRef = useRef<string | null>(null);
  
  const [state, setState] = useState<WebRTCState>({
    isInitialized: false,
    isConnecting: false,
    hasLocalStream: false,
    hasRemoteStream: false,
    isConnected: false,
    error: null
  });

  // 상태 업데이트 함수
  const updateState = useCallback((updates: Partial<WebRTCState>) => {
    setState((prev: WebRTCState) => {
      const newState = { ...prev, ...updates };
      
      // 상태 변경 알림
      if (onStatusChange) {
        onStatusChange({
          isInitialized: newState.isInitialized,
          isConnecting: newState.isConnecting,
          hasMedia: newState.hasLocalStream,
          isPeerConnected: newState.isConnected,
          error: newState.error
        });
      }
      
      return newState;
    });
  }, [onStatusChange]);

  // 1. 미디어 스트림 정리
  const cleanupMediaStream = useCallback((stream: MediaStream | null) => {
    if (!stream) return;
    
    stream.getTracks().forEach(track => {
      track.stop();
      stream.removeTrack(track);
    });
  }, []);

  // 2. WebRTC 연결 정리
  const cleanupWebRTC = useCallback(() => {
    if (state.isInitialized) {
      console.log('🧹 WebRTC 정리 시작...');

      // 1) 스트림 정리
      cleanupMediaStream(localStreamRef.current);
      cleanupMediaStream(remoteStreamRef.current);
      localStreamRef.current = null;
      remoteStreamRef.current = null;

      // 2) PeerConnection 정리
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      // 3) 상태 초기화
      updateState({
        isInitialized: false,
        isConnecting: false,
        hasLocalStream: false,
        hasRemoteStream: false,
        isConnected: false,
        error: null
      });

      console.log('✨ WebRTC 정리 완료');
    }
  }, [state.isInitialized, updateState, cleanupMediaStream]);

  // 3. 미디어 스트림 초기화
  const initializeMediaStream = useCallback(async () => {
    try {
      console.log('🎥 미디어 스트림 초기화 시작...');
      
      // 권한 상태 확인 및 관리
      const shouldRequestPermission = () => {
        try {
          // localStorage에서 권한 상태 확인
          const permissionGranted = localStorage.getItem('media-permission-granted');
          const permissionSession = localStorage.getItem('media-permission-session');
          
          // 이전에 권한을 거부했거나, 세션이 없는 경우 새로 요청
          if (!permissionGranted || !permissionSession) {
            console.log('🔑 새로운 권한 요청 필요');
            return true;
          }
          
          console.log('🔑 이전 권한 상태 확인됨');
          return false;
        } catch (error) {
          console.warn('⚠️ 권한 상태 확인 실패, 새로 요청:', error);
          return true;
        }
      };
      
      // 브라우저 권한 API로 현재 권한 상태 확인
      try {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        console.log('🎵 마이크 권한 상태:', micPermission.state);
        console.log('📹 카메라 권한 상태:', cameraPermission.state);
        
        // 권한이 명시적으로 거부된 경우
        if (micPermission.state === 'denied' || cameraPermission.state === 'denied') {
          throw new Error('마이크 또는 카메라 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
        }
        
        // 권한이 prompt 상태이거나, localStorage에 상태가 없는 경우 재요청
        if (micPermission.state === 'prompt' || cameraPermission.state === 'prompt' || shouldRequestPermission()) {
          console.log('🔄 미디어 권한 재요청 필요');
          // localStorage 상태 초기화
          localStorage.removeItem('media-permission-granted');
          localStorage.removeItem('media-permission-session');
        }
        
      } catch (permissionError) {
        console.warn('⚠️ 권한 확인 실패 (계속 진행):', permissionError);
      }
      
      // 미디어 스트림 요청
      console.log('🎤 사용자에게 미디어 권한 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // 권한 허용 성공 시 localStorage에 상태 저장
      try {
        const sessionId = Date.now().toString();
        localStorage.setItem('media-permission-granted', 'true');
        localStorage.setItem('media-permission-session', sessionId);
        console.log('🔑 미디어 권한 허용 상태 저장됨 - 세션:', sessionId);
        
        // 권한 허용 타입 감지 (완전 허용 vs 이번만 허용)
        // 참고: 브라우저에서 "이번만 허용하기"의 경우 페이지 새로고침 시 권한이 초기화됨
        setTimeout(() => {
          // 1초 후 권한 상태 재확인하여 "이번만 허용하기" 여부 판단
          navigator.permissions.query({ name: 'microphone' as PermissionName }).then(result => {
            if (result.state === 'granted') {
              console.log('✅ 완전 권한 허용으로 판단');
              localStorage.setItem('media-permission-type', 'permanent');
            } else {
              console.log('⏰ 이번만 허용하기로 판단');
              localStorage.setItem('media-permission-type', 'temporary');
            }
          }).catch(error => {
            console.warn('⚠️ 권한 타입 판단 실패:', error);
          });
        }, 1000);
        
      } catch (storageError) {
        console.warn('⚠️ 권한 상태 저장 실패:', storageError);
      }

      // 🔍 스트림 트랙 상태 디버깅
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      
      console.log('🎵 오디오 트랙 개수:', audioTracks.length);
      console.log('📹 비디오 트랙 개수:', videoTracks.length);
      
      audioTracks.forEach((track, index) => {
        console.log(`🎵 오디오 트랙 ${index}:`, {
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          kind: track.kind
        });
      });
      
      videoTracks.forEach((track, index) => {
        console.log(`📹 비디오 트랙 ${index}:`, {
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          kind: track.kind
        });
      });

      // 오디오 트랙이 없으면 경고
      if (audioTracks.length === 0) {
        console.warn('⚠️ 오디오 트랙이 없습니다. 마이크 권한을 확인하세요.');
      }

      localStreamRef.current = stream;
      updateState({ hasLocalStream: true });
      
      // PeerConnection에 스트림 추가
      if (peerConnection.current && stream) {
        stream.getTracks().forEach(track => {
          if (peerConnection.current) {
            peerConnection.current.addTrack(track, stream);
          }
        });
      }

      console.log('✨ 미디어 스트림 초기화 완료');
      return stream;
    } catch (error) {
      console.error('🚨 미디어 스트림 초기화 실패:', error);
      
      // 권한 거부 시 localStorage 상태 정리
      try {
        localStorage.removeItem('media-permission-granted');
        localStorage.removeItem('media-permission-session');
        localStorage.removeItem('media-permission-type');
        console.log('🧹 권한 거부로 인한 상태 정리 완료');
      } catch (cleanupError) {
        console.warn('⚠️ 권한 상태 정리 실패:', cleanupError);
      }
      
      // 더 구체적인 에러 메시지 제공
      let userFriendlyMessage = '미디어 스트림 초기화 실패';
      
      if (error instanceof Error) {
        const errorName = error.name;
        const errorMessage = error.message;
        
        switch (errorName) {
          case 'NotAllowedError':
            userFriendlyMessage = '마이크 또는 카메라 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
            break;
          case 'NotFoundError':
            userFriendlyMessage = '마이크 또는 카메라 장치를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.';
            break;
          case 'NotReadableError':
            userFriendlyMessage = '마이크 또는 카메라 장치가 다른 애플리케이션에서 사용 중입니다.';
            break;
          case 'OverconstrainedError':
            userFriendlyMessage = '요청한 미디어 설정을 지원하지 않습니다.';
            console.log('⚠️ 백업으로 기본 설정을 사용해주세요.');
            break;
          case 'SecurityError':
            userFriendlyMessage = '보안 정책으로 인해 미디어 접근이 차단되었습니다. HTTPS 환경에서 접속해주세요.';
            break;
          default:
            userFriendlyMessage = `미디어 스트림 초기화 실패: ${errorMessage}`;
        }
        
        console.error(`📋 에러 상세: ${errorName} - ${errorMessage}`);
      }
      
      const enhancedError = new Error(userFriendlyMessage);
      updateState({ error: enhancedError });
      throw enhancedError;
    }
  }, [updateState]);

  // 4. WebRTC 연결 초기화
  const initializeWebRTC = useCallback(async () => {
    if (!socket) {
      throw new Error('소켓 연결이 필요합니다.');
    }

    try {
      console.log('🎥 WebRTC 초기화 시작...');
      updateState({ isConnecting: true });

      // 1. RTCPeerConnection 생성
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnection.current = pc;

      // 2. 미디어 스트림 가져오기
      const stream = await initializeMediaStream();

      // 3. 원격 스트림 처리
      pc.ontrack = (event) => {
        console.log('📡 원격 트랙 수신:', event.streams[0]);
        remoteStreamRef.current = event.streams[0];
        updateState({ hasRemoteStream: true });
      };

      // 4. ICE 후보 처리
      pc.onicecandidate = (event) => {
        if (event.candidate && roomIdRef.current) {
          console.log('🧊 ICE 후보 전송');
          socket.emit('ice-candidate', {
            roomId: roomIdRef.current,
            candidate: event.candidate
          });
        }
      };

      // 5. 연결 상태 변경 처리
      pc.onconnectionstatechange = () => {
        console.log('📡 연결 상태 변경:', pc.connectionState);
        updateState({
          isConnected: pc.connectionState === 'connected',
          error: pc.connectionState === 'failed' ? new Error('연결 실패') : null
        });
      };

      updateState({
        isInitialized: true,
        isConnecting: false,
        error: null
      });

      console.log('✅ WebRTC 초기화 완료');
      return pc;

    } catch (error: unknown) {
      console.error('❌ WebRTC 초기화 실패:', error);
      updateState({
        isInitialized: false,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('WebRTC 초기화 실패')
      });
      throw error;
    }
  }, [socket, updateState, initializeMediaStream]);

  // WebRTC 시그널링 이벤트 핸들러
  const handleOffer = useCallback(async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
    try {
      console.log('📥 Offer 수신 from:', data.from);
      const pc = peerConnection.current || await initializeWebRTC();
      
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log('📤 Answer 전송 to:', data.from);
      if (socket && roomIdRef.current) {
        socket.emit('answer', {
          roomId: roomIdRef.current,
          answer: pc.localDescription
        });
      }

    } catch (error: unknown) {
      console.error('❌ Offer 처리 실패:', error);
      updateState({ 
        error: error instanceof Error ? error : new Error('Offer 처리 실패')
      });
    }
  }, [socket, updateState, initializeWebRTC]);

  const handleAnswer = useCallback(async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
    try {
      if (!peerConnection.current) {
        throw new Error('PeerConnection이 초기화되지 않았습니다.');
      }

      console.log('📥 Answer 수신 from:', data.from);
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );

    } catch (error: unknown) {
      console.error('❌ Answer 처리 실패:', error);
      updateState({
        error: error instanceof Error ? error : new Error('Answer 처리 실패')
      });
    }
  }, [updateState]);

  const handleIceCandidate = useCallback(async (data: { from: string; candidate: RTCIceCandidateInit }) => {
    try {
      if (!peerConnection.current) {
        throw new Error('PeerConnection이 초기화되지 않았습니다.');
      }

      console.log('📥 ICE 후보 수신 from:', data.from);
      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );

    } catch (error: unknown) {
      console.error('❌ ICE 후보 처리 실패:', error);
      updateState({
        error: error instanceof Error ? error : new Error('ICE 후보 처리 실패')
      });
    }
  }, [updateState]);

  // 5. 연결 시작 (중복 연결 방지)
  const connectionAttemptedRef = useRef(false);
  
  const startConnection = useCallback(async () => {
    try {
      // 중복 연결 시도 방지
      if (connectionAttemptedRef.current) {
        console.log('⚠️ 이미 연결 시도가 진행 중입니다. 중복 시도를 건너뜁니다.');
        return;
      }

      // 소켓 연결 상태 체크 강화
      if (!socket) {
        console.warn('⚠️ 소켓이 아직 초기화되지 않았습니다. 연결 시도를 건너뜁니다.');
        return;
      }

      if (!socket.connected) {
        console.warn('⚠️ 소켓이 연결되지 않았습니다. 연결 시도를 건너뜁니다.');
        return;
      }

      connectionAttemptedRef.current = true;
      const pc = peerConnection.current || await initializeWebRTC();

      // 1. Offer 생성 및 전송
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('📤 Offer 전송 (첫 시도)');
      const currentRoomId = roomId || roomIdRef.current;
      if (currentRoomId) {
        socket.emit('offer', {
          roomId: currentRoomId,
          offer: pc.localDescription
        });
        roomIdRef.current = currentRoomId; // roomId 저장
        console.log('✅ Offer 전송 완료 - roomId:', currentRoomId);
      } else {
        console.warn('⚠️ Room ID가 설정되지 않았습니다. Offer 전송을 건너뜁니다.');
        connectionAttemptedRef.current = false; // 실패 시 리셋
      }

    } catch (error: unknown) {
      console.error('❌ 연결 시작 실패:', error);
      connectionAttemptedRef.current = false; // 실패 시 리셋
      updateState({
        error: error instanceof Error ? error : new Error('연결 시작 실패')
      });
    }
  }, [socket, roomId, updateState, initializeWebRTC]);

  // roomId 변경 시 연결 상태 리셋
  useEffect(() => {
    if (roomId) {
      console.log('📍 WebRTC roomId 변경:', roomId);
      connectionAttemptedRef.current = false; // 새 roomId에 대해 연결 시도 리셋
    }
  }, [roomId]);

  // 6. 컴포넌트 마운트/언마운트 처리 (최적화된 의존성)
  useEffect(() => {
    // 소켓이 유효한지 확인 - 더 엄격한 체크
    if (socket && socket.connected && typeof socket.on === 'function') {
      console.log('✅ 소켓 이벤트 리스너 설정 중...');
      
      // 소켓 이벤트 리스너 설정
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice-candidate', handleIceCandidate);
    } else if (socket !== null) {
      // socket이 null이 아닌데 연결되지 않은 경우에만 경고 출력
      // (socket === null인 초기 상태는 정상이므로 경고하지 않음)
      // 단, 마운트 직후 연결 시도 중인 경우는 경고하지 않음
      if (socket.connected === false) {
        console.warn('⚠️ 소켓이 유효하지 않거나 연결되지 않음:', { 
          hasSocket: !!socket, 
          isConnected: socket?.connected, 
          hasOnMethod: typeof socket?.on === 'function' 
        });
      }
    }

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('offer', handleOffer);
        socket.off('answer', handleAnswer);
        socket.off('ice-candidate', handleIceCandidate);
      }
      cleanupWebRTC();
    };
  }, [socket]); // ✅ socket만 의존성으로 유지

  // ICE 연결 상태 모니터링
  useEffect(() => {
    const pc = peerConnection.current;
    if (!pc) return;

    const handleIceConnectionStateChange = () => {
      console.log('🧊 ICE 연결 상태:', pc.iceConnectionState);
      switch (pc.iceConnectionState) {
        case 'checking':
          updateState({ isConnecting: true });
          break;
        case 'connected':
        case 'completed':
          updateState({ 
            isConnecting: false,
            isConnected: true,
            error: null
          });
          break;
        case 'failed':
          updateState({
            isConnecting: false,
            isConnected: false,
            error: new Error('ICE 연결 실패')
          });
          break;
        case 'disconnected':
          updateState({
            isConnecting: false,
            isConnected: false,
            error: new Error('ICE 연결 끊김')
          });
          break;
      }
    };

    pc.oniceconnectionstatechange = handleIceConnectionStateChange;

    return () => {
      pc.oniceconnectionstatechange = null;
    };
  }, [updateState]);

  // 7. 상태 및 스트림 반환
  return {
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    transcription,
    status: {
      isInitialized: state.isInitialized,
      isConnecting: state.isConnecting,
      hasMedia: state.hasLocalStream,
      isPeerConnected: state.isConnected,
      error: state.error
    },
    startConnection,
    cleanup: cleanupWebRTC
  };
}; 