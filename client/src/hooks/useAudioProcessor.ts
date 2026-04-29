import { useCallback, useRef, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface AudioError {
  type: string;
  message: string;
  timestamp: string;
  code?: string;
}

interface AudioProcessorEvent extends MessageEvent {
  data: {
    type: 'audioData' | 'volume';
    audioData?: ArrayBuffer;
    volume?: number;
  };
}

interface UseAudioProcessorProps {
  roomId: string;
  stream: MediaStream | null;
  language?: string;
  socket?: any;
  isConnected?: boolean;
  isEnabled?: boolean;
  onTranscriptionReceived?: (text: string) => void;
  onError?: (error: AudioError) => void;
}

// 오디오 처리 설정
const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

export function useAudioProcessor({
  roomId,
  stream,
  language = 'ko-KR',
  socket,
  isConnected,
  isEnabled = true,
  onTranscriptionReceived,
  onError
}: UseAudioProcessorProps) {
  // 전달받은 소켓과 연결 상태 사용 (자체 useSocket() 호출 제거)
  
  // 상태 관리
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<AudioError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // 참조 관리
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  
  // 이전 스트림 상태 추적 (무한 루프 방지)
  const previousStreamRef = useRef<MediaStream | null>(null);
  const previousUserInteractedRef = useRef<boolean>(false);
  const previousIsEnabledRef = useRef<boolean>(true);

  // 사용자 상호작용 상태를 즉시 반영하기 위한 ref
  const userInteractedRef = useRef<boolean>(false);

  // 사용자 상호작용 수동 활성화 함수 - 개선된 버전
  const setUserInteractionManually = useCallback(() => {
    console.log('👆 사용자 상호작용 수동 설정됨');
    setUserInteracted(true);
    userInteractedRef.current = true; // ref도 즉시 업데이트
  }, []);

  // 사용자 상호작용 감지
  useEffect(() => {
    const handleUserInteraction = () => {
      console.log('👆 사용자 상호작용 감지됨');
      setUserInteracted(true);
      userInteractedRef.current = true; // ref도 함께 업데이트
      
      // 이벤트 리스너 제거
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    if (!userInteracted) {
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [userInteracted]);

  // userInteracted 상태 변경 시 ref 동기화
  useEffect(() => {
    userInteractedRef.current = userInteracted;
  }, [userInteracted]);

  // 소켓 연결 시 자막 이벤트 리스너 등록
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTranscription = (data: { text: string; confidence?: number; userId?: string }) => {
      console.log('📝 클라이언트 자막 수신:', {
        text: data.text,
        confidence: data.confidence,
        userId: data.userId,
        timestamp: new Date().toISOString()
      });
      onTranscriptionReceived?.(data.text);
    };

    const handleError = (error: { code: string; message: string }) => {
      console.error('❌ 소켓 에러 수신:', error);
    };

    socket.on('transcription', handleTranscription);
    socket.on('error', handleError);

    return () => {
      socket.off('transcription', handleTranscription);
      socket.off('error', handleError);
    };
  }, [socket, isConnected, onTranscriptionReceived]);

  // 2. Float32Array를 Int16Array로 변환
  const convertFloat32ToInt16 = useCallback((float32Array: Float32Array) => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }, []);

  const handleError = useCallback((err: Error | string, code?: string) => {
    const errorObj: AudioError = {
      type: err instanceof Error ? err.name : 'AudioError',
      message: err instanceof Error ? err.message : err,
      timestamp: new Date().toISOString(),
      code
    };
    
    console.error('🚨 오디오 처리 오류:', errorObj);
    setError(errorObj);
    onError?.(errorObj);

    // 심각한 오류 시 자동 복구 시도
    if (code === 'AUDIO_CONTEXT_FAILED' || code === 'WORKLET_FAILED') {
      console.log('🔄 오디오 시스템 복구 시도...');
      cleanup();
      setIsInitialized(false);
      
      // 3초 후 재시도
      setTimeout(() => {
        if (userInteracted && stream) {
          initializeAudioContext().catch((error: Error) => 
            console.error('❌ 복구 시도 실패:', error)
          );
        }
      }, 3000);
    }
  }, [onError, userInteracted, stream]);

  // 처리 중 상태를 ref로 관리 (즉시 반영)
  const isProcessingRef = useRef(false);

  // 오디오 청크 처리 함수
  const processAudioChunk = useCallback((audioBuffer: ArrayBuffer) => {
    // isProcessing state 대신 isProcessingRef.current만 사용 (React 비동기 업데이트 문제 해결)
    if (!socket || !isConnected || !isProcessingRef.current) {
      // 조건 미충족시 조용히 처리 (로그 스팸 방지)
      return;
    }

    try {
      // ArrayBuffer를 Uint8Array로 변환
      const uint8Array = new Uint8Array(audioBuffer);
      
      // 16-bit PCM 샘플 생성
      const samples = new Float32Array(uint8Array.length / 2);
      const dataView = new DataView(audioBuffer);
      
      for (let i = 0; i < samples.length; i++) {
        // 16-bit PCM을 float로 변환 (-1.0 ~ 1.0 범위)
        const sample = dataView.getInt16(i * 2, true) / 32768.0;
        samples[i] = sample;
      }
      
      // RMS (Root Mean Square) 계산으로 볼륨 레벨 측정
      let sumSquares = 0;
      for (let i = 0; i < samples.length; i++) {
        sumSquares += samples[i] * samples[i];
      }
      const volumeLevel = Math.sqrt(sumSquares / samples.length);

      // 무음 필터링 임계값 설정 (환경 소음 차단)
      const SILENCE_THRESHOLD = 0.020; // 환경 소음보다 높은 임계값
      
      // NaN 체크
      if (isNaN(volumeLevel)) {
        console.warn('⚠️ 볼륨 계산 오류 (NaN) - 전송 차단');
        return;
      }
      
      // 무음 필터링 적용
      if (volumeLevel < SILENCE_THRESHOLD) {
        // 무음 상태는 조용히 처리 (로그 없음)
        return;
      }
      
      // 유효한 음성 감지시에만 로그 출력
      console.log('🎵 유효한 음성 감지 - 전송 시작:', {
        volumeLevel: volumeLevel.toFixed(6),
        threshold: SILENCE_THRESHOLD
      });

      // 오디오 데이터 전송
      const base64Audio = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      const audioDataBase64 = btoa(base64Audio);
      
      console.log('📤 음성 데이터 전송:', {
        roomId,
        base64Length: audioDataBase64.length,
        volumeLevel: volumeLevel.toFixed(6),
        timestamp: Date.now()
      });
      
      socket.emit('audio-data', {
        roomId,
        audioData: audioDataBase64,
        language: 'ko-KR' // 추후 사용자 설정으로 변경
      });
      
      console.log('✅ 소켓 전송 완료');
      
    } catch (error) {
      console.error('❌ 오디오 처리 중 오류:', error);
    }
  }, [socket, isConnected, isProcessing, roomId]);

  // AudioContext 초기화 함수 - 개선된 버전
  const initializeAudioContext = useCallback(async () => {
    console.log('🔧 AudioContext 초기화 프로세스 시작');
    console.log('🔧 초기화 조건 확인:', {
      userInteracted,
      isEnabled,
      hasExistingContext: !!audioContextRef.current,
      hasWorkletNode: !!workletNodeRef.current,
      isInitialized
    });

    // 이미 초기화 중이면 기다림
    if (initializationPromiseRef.current) {
      console.log('⏳ 이미 초기화 중... 대기');
      return initializationPromiseRef.current;
    }

    // 이미 초기화되었으면 바로 반환
    if (isInitialized && audioContextRef.current && workletNodeRef.current) {
      console.log('✅ 이미 초기화 완료됨');
      return Promise.resolve();
    }

    initializationPromiseRef.current = (async () => {
      try {
        console.log('🎵 AudioContext 초기화 시작...');
        
        // 기존 AudioContext 정리
        if (audioContextRef.current) {
          console.log('🧹 기존 AudioContext 정리 중...');
          try {
            if (audioContextRef.current.state !== 'closed') {
              await audioContextRef.current.close();
            }
          } catch (closeError) {
            console.warn('⚠️ 기존 AudioContext 정리 실패:', closeError);
          }
          audioContextRef.current = null;
        }

        // 새로운 AudioContext 생성
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('이 브라우저는 AudioContext를 지원하지 않습니다.');
        }

        console.log('🔧 새 AudioContext 생성 중...');
        audioContextRef.current = new AudioContextClass({
          sampleRate: 48000,
          latencyHint: 'interactive'
        });
        
        // AudioContext 상태 확인
        if (!audioContextRef.current) {
          throw new Error('AudioContext 생성 실패');
        }
        
        console.log('✅ AudioContext 생성 완료:', {
          state: audioContextRef.current.state,
          sampleRate: audioContextRef.current.sampleRate
        });
        
        // AudioContext가 suspended 상태면 resume (사용자 상호작용 필요)
        if (audioContextRef.current.state === 'suspended') {
          console.log('🔄 AudioContext 재시작 시도 중...');
          try {
            await audioContextRef.current.resume();
            console.log('✅ AudioContext 재시작 완료:', audioContextRef.current.state);
          } catch (resumeError) {
            console.warn('⚠️ AudioContext 재시작 실패:', resumeError);
            // suspended 상태여도 계속 진행 (나중에 사용자 상호작용으로 해결될 수 있음)
          }
        }

        // AudioWorklet 모듈 로드
        console.log('🔧 AudioWorklet 모듈 로드 시작...');
        const workletPath = '/audio-processor.js';
        console.log('🔧 WorkletPath:', workletPath);
        
        try {
          await audioContextRef.current.audioWorklet.addModule(workletPath);
          console.log('✅ AudioWorklet 모듈 로드 완료');
        } catch (workletError) {
          console.error('❌ AudioWorklet 모듈 로드 상세 실패:', {
            error: workletError,
            message: workletError instanceof Error ? workletError.message : String(workletError),
            stack: workletError instanceof Error ? workletError.stack : undefined,
            workletPath
          });
          
          // 네트워크 또는 파일 로드 문제일 수 있으므로 상세 정보 제공
          if (workletError instanceof Error && workletError.message.includes('404')) {
            throw new Error(`AudioWorklet 파일을 찾을 수 없습니다 (${workletPath}). 파일이 public 폴더에 있는지 확인하세요.`);
          } else if (workletError instanceof Error && workletError.message.includes('syntax')) {
            throw new Error(`AudioWorklet 파일에 문법 오류가 있습니다: ${workletError.message}`);
          } else {
            throw new Error(`AudioWorklet 모듈 로드 실패: ${workletError instanceof Error ? workletError.message : 'Unknown error'}`);
          }
        }
        
        // AudioWorkletNode 생성
        console.log('🔧 AudioWorkletNode 생성 시작...');
        if (!audioContextRef.current) {
          throw new Error('AudioContext가 초기화되지 않았습니다');
        }
        
        try {
          workletNodeRef.current = new AudioWorkletNode(
            audioContextRef.current,
            'audio-processor',
            {
              numberOfInputs: 1,
              numberOfOutputs: 1,
              channelCount: 1,
              channelCountMode: 'explicit',
              channelInterpretation: 'speakers'
            }
          );
          
          if (!workletNodeRef.current) {
            throw new Error('AudioWorkletNode 생성 실패');
          }
          
          console.log('✅ AudioWorkletNode 생성 완료');
        } catch (nodeError) {
          console.error('❌ AudioWorkletNode 생성 상세 실패:', {
            error: nodeError,
            message: nodeError instanceof Error ? nodeError.message : String(nodeError),
            stack: nodeError instanceof Error ? nodeError.stack : undefined
          });
          throw new Error(`AudioWorkletNode를 생성할 수 없습니다: ${nodeError instanceof Error ? nodeError.message : 'Unknown error'}`);
        }

        // 오디오 처리 이벤트 설정
        console.log('🔧 AudioWorklet 이벤트 리스너 설정 완료');
        workletNodeRef.current.port.onmessage = (event: AudioProcessorEvent) => {
          // 볼륨 메시지는 조용히 처리 (로그 없음)
          if (event.data.type === 'volume' && typeof event.data.volume === 'number') {
            setVolume(event.data.volume);
            return;
          }

          // audioData 메시지 처리 (로그 간소화)
          if (event.data.type === 'audioData' && event.data.audioData) {
            processAudioChunk(event.data.audioData);
          }
        };

        // 오류 처리
        workletNodeRef.current.port.onmessageerror = (error) => {
          console.error('❌ AudioWorklet 메시지 오류:', error);
          handleError(new Error('AudioWorklet 통신 오류'), 'WORKLET_MESSAGE_ERROR');
        };

        // 성공적으로 완료
        setIsInitialized(true);
        console.log('🎉 AudioContext 초기화 완전 완료!');
        
        return Promise.resolve();
        
      } catch (error) {
        console.error('❌ AudioContext 초기화 완전 실패:', {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // 실패 시 정리
        if (audioContextRef.current) {
          try {
            if (audioContextRef.current.state !== 'closed') {
              await audioContextRef.current.close();
            }
          } catch (closeError) {
            console.error('❌ AudioContext 정리 실패:', closeError);
          }
          audioContextRef.current = null;
        }
        
        if (workletNodeRef.current) {
          try {
            workletNodeRef.current.disconnect();
          } catch (disconnectError) {
            console.error('❌ WorkletNode 연결 해제 실패:', disconnectError);
          }
          workletNodeRef.current = null;
        }
        
        setIsInitialized(false);
        
        if (error instanceof Error) {
          handleError(error, 'AUDIO_CONTEXT_FAILED');
        }
        
        throw error;
      } finally {
        // 초기화 Promise 리셋
        initializationPromiseRef.current = null;
        console.log('🔄 초기화 Promise 리셋 완료');
      }
    })();

    return initializationPromiseRef.current;
  }, [userInteracted, isEnabled, processAudioChunk, handleError, isInitialized]);

  // 미디어 스트림을 AudioWorklet에 연결
  const connectMediaStream = useCallback(async (stream: MediaStream) => {
    try {
      console.log('🔗 미디어 스트림 연결 시도...');
      
      // AudioContext 초기화 확인
      if (!isInitialized || !audioContextRef.current || !workletNodeRef.current) {
        console.log('⏳ AudioContext 초기화 대기 중...');
        await initializeAudioContext();
        
        if (!audioContextRef.current || !workletNodeRef.current) {
          throw new Error('AudioContext 또는 WorkletNode 초기화 실패');
        }
      }

      // 🔍 스트림 오디오 트랙 확인
      const audioTracks = stream.getAudioTracks();
      console.log('🎵 연결할 오디오 트랙 개수:', audioTracks.length);
      
      if (audioTracks.length === 0) {
        throw new Error('미디어 스트림에 오디오 트랙이 없습니다. 마이크 권한을 확인하세요.');
      }
      
      // 오디오 트랙 상태 확인
      const activeAudioTracks = audioTracks.filter(track => track.readyState === 'live');
      console.log('🎵 활성 오디오 트랙 개수:', activeAudioTracks.length);
      
      if (activeAudioTracks.length === 0) {
        throw new Error('활성 오디오 트랙이 없습니다. 마이크 장치를 확인하세요.');
      }
      
      // 기존 연결 정리
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (disconnectError) {
          console.warn('⚠️ 기존 소스 노드 연결 해제 실패:', disconnectError);
        }
        sourceNodeRef.current = null;
      }

      // 미디어 스트림에서 오디오 소스 생성
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      if (!sourceNodeRef.current) {
        throw new Error('MediaStreamSource 생성 실패');
      }
      
      // AudioWorkletNode에 연결
      sourceNodeRef.current.connect(workletNodeRef.current);
      
      // 스트림 참조 저장
      streamRef.current = stream;

      console.log('✅ 미디어 스트림 연결 완료');
      console.log('🎵 AudioContext 상태:', audioContextRef.current.state);
      
    } catch (error) {
      console.error('❌ 미디어 스트림 연결 실패:', error);
      
      // 실패 시 정리
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (disconnectError) {
          console.warn('⚠️ 소스 노드 정리 실패:', disconnectError);
        }
        sourceNodeRef.current = null;
      }
      
      if (error instanceof Error) {
        handleError(error, 'STREAM_CONNECTION_FAILED');
      }
      
      throw error;
    }
  }, [isInitialized, initializeAudioContext, handleError]);

  // 정리 함수
  const cleanup = useCallback(() => {
    console.log('🧹 AudioProcessor 정리 시작...');
    
    isProcessingRef.current = false;
    setIsProcessing(false);
    
    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.disconnect();
      } catch (error) {
        console.warn('⚠️ WorkletNode 연결 해제 실패:', error);
      }
      workletNodeRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (error) {
        console.warn('⚠️ SourceNode 연결 해제 실패:', error);
      }
      sourceNodeRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        try {
          track.stop();
        } catch (error) {
          console.warn('⚠️ 미디어 트랙 정지 실패:', error);
        }
      });
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (error) {
        console.warn('⚠️ AudioContext 정리 실패:', error);
      }
      audioContextRef.current = null;
    }

    setIsInitialized(false);
    initializationPromiseRef.current = null;
    
    console.log('✨ AudioProcessor 정리 완료');
  }, []);

  // 오디오 처리 시작 - 내부 함수로 변경하여 의존성 순환 방지
  const startProcessingInternal = useCallback(async () => {
    try {
      console.log('🎤 오디오 처리 시작 시도...', {
        userInteracted,
        userInteractedRef: userInteractedRef.current,
        hasStream: !!stream,
        isEnabled,
        hasSocket: !!socket,
        isConnected,
        isInitialized
      });

      // ref 값과 state 값 중 하나라도 true이면 사용자 상호작용으로 간주
      const actualUserInteracted = userInteracted || userInteractedRef.current;

      if (!actualUserInteracted) {
        throw new Error('사용자 상호작용이 필요합니다. 화면을 클릭하거나 키를 눌러주세요.');
      }

      if (!stream) {
        throw new Error('미디어 스트림이 없습니다');
      }

      if (!isEnabled) {
        console.log('⏸️ 오디오 처리가 비활성화되어 있습니다.');
        return;
      }

      if (!socket || !isConnected) {
        console.log('⚠️ 소켓 연결이 필요합니다:', { hasSocket: !!socket, isConnected });
        return;
      }

      console.log('🎤 오디오 처리 시작...');
      
      // AudioContext 초기화 및 스트림 연결
      await connectMediaStream(stream);
      
      // 처리 시작
      if (workletNodeRef.current) {
        console.log('📨 WorkletNode에 처리 시작 메시지 전송...');
        
        // ref 값을 먼저 업데이트 (즉시 반영)
        isProcessingRef.current = true;
        
        workletNodeRef.current.port.postMessage({ isProcessing: true });
        setIsProcessing(true);
        console.log('✅ 오디오 처리 시작됨 - isProcessing:', true, 'isProcessingRef:', isProcessingRef.current);
      } else {
        console.error('❌ WorkletNode가 없습니다!');
      }
      
    } catch (error) {
      console.error('❌ 오디오 처리 시작 실패:', error);
      if (error instanceof Error) {
        handleError(error, 'START_PROCESSING_FAILED');
      }
    }
  }, [userInteracted, stream, isEnabled, socket, isConnected, isInitialized, connectMediaStream, handleError]);

  // 오디오 처리 중지 - 내부 함수로 변경하여 의존성 순환 방지
  const stopProcessingInternal = useCallback(() => {
    console.log('🛑 오디오 처리 중지...');
    
    // ref 값을 먼저 업데이트 (즉시 반영)
    isProcessingRef.current = false;
    
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ isProcessing: false });
    }
    
    setIsProcessing(false);
    console.log('✅ 오디오 처리 중지됨');
  }, []);

  // 스트림 변경 감지 - 최적화된 버전 (무한 루프 방지)
  useEffect(() => {
    const currentStream = stream;
    const currentUserInteracted = userInteracted;
    const currentIsEnabled = isEnabled;
    const currentSocket = socket;
    const currentIsConnected = isConnected;
    
    const previousStream = previousStreamRef.current;
    const previousUserInteracted = previousUserInteractedRef.current;
    const previousIsEnabled = previousIsEnabledRef.current;
    
    // 실제 변경이 있을 때만 처리
    const hasStreamChanged = currentStream !== previousStream;
    const hasUserInteractionChanged = currentUserInteracted !== previousUserInteracted;
    const hasEnabledChanged = currentIsEnabled !== previousIsEnabled;
    
    if (hasStreamChanged || hasUserInteractionChanged || hasEnabledChanged) {
      console.log('🔄 오디오 상태 변경 감지:', {
        stream: !!currentStream,
        userInteracted: currentUserInteracted,
        isEnabled: currentIsEnabled,
        socket: !!currentSocket,
        isConnected: currentIsConnected,
        변경사항: {
          스트림: hasStreamChanged,
          사용자상호작용: hasUserInteractionChanged,
          활성화: hasEnabledChanged
        }
      });
      
      if (currentStream && currentUserInteracted && currentIsEnabled && currentSocket && currentIsConnected) {
        console.log('🔄 오디오 처리 시작 조건 충족');
        startProcessingInternal().catch((error) => {
          console.error('❌ 자동 연결 실패:', error);
        });
      } else {
        console.log('🔄 오디오 처리 조건 미충족:', {
          hasStream: !!currentStream,
          userInteracted: currentUserInteracted,
          isEnabled: currentIsEnabled,
          hasSocket: !!currentSocket,
          isConnected: currentIsConnected
        });
        if (!currentStream) {
          console.log('🔄 스트림 제거됨 - 처리 중지');
          stopProcessingInternal();
        }
      }
      
      // 이전 상태 업데이트
      previousStreamRef.current = currentStream;
      previousUserInteractedRef.current = currentUserInteracted;
      previousIsEnabledRef.current = currentIsEnabled;
    }
  }, [stream, userInteracted, isEnabled, socket, isConnected]); // 소켓 상태도 의존성에 추가

  // 외부 API용 함수들 (메모이제이션된 버전)
  const startProcessing = useCallback(() => {
    return startProcessingInternal();
  }, [startProcessingInternal]);

  const stopProcessing = useCallback(() => {
    return stopProcessingInternal();
  }, [stopProcessingInternal]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log('🧹 useAudioProcessor 언마운트 정리...');
      cleanup();
    };
  }, [cleanup]);

  return {
    isProcessing,
    volume,
    error,
    isInitialized,
    userInteracted,
    startProcessing,
    stopProcessing,
    cleanup,
    setUserInteractionManually
  };
}

// 유틸리티 함수: 문자열을 DataView에 쓰기
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
} 