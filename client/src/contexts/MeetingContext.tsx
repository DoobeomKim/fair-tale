'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// 상태 타입 정의
interface MeetingState {
  // 기본 상태
  pin: string;
  isJoining: boolean;
  isJoined: boolean;
  isLeaving: boolean;
  error: string | null;
  transcription: string;
  
  // 연결 상태
  isConnected: boolean;
  socket: any;
  webrtcStatus: {
    isInitialized: boolean;
    isConnecting: boolean;
    hasMedia: boolean;
    isPeerConnected: boolean;
    error: Error | null;
  } | null;
  
  // 미디어 상태
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  
  // 나가기 진행 상황
  leaveProgress: {
    step: string;
    message: string;
    isComplete: boolean;
  };
}

// 액션 타입 정의
type MeetingAction =
  | { type: 'SET_PIN'; payload: string }
  | { type: 'SET_JOINING'; payload: boolean }
  | { type: 'SET_JOINED'; payload: boolean }
  | { type: 'SET_LEAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSCRIPTION'; payload: string }
  | { type: 'APPEND_TRANSCRIPTION'; payload: string }
  | { type: 'CLEAR_TRANSCRIPTION' }
  | { type: 'SET_CONNECTION_STATE'; payload: { isConnected: boolean; socket: any; webrtcStatus: any } }
  | { type: 'SET_MEDIA_STREAMS'; payload: { localStream: MediaStream | null; remoteStream: MediaStream | null } }
  | { type: 'SET_AUDIO_ENABLED'; payload: boolean }
  | { type: 'SET_VIDEO_ENABLED'; payload: boolean }
  | { type: 'SET_LEAVE_PROGRESS'; payload: { step: string; message: string; isComplete: boolean } }
  | { type: 'RESET_STATE' };

// 초기 상태
const initialState: MeetingState = {
  pin: '',
  isJoining: false,
  isJoined: false,
  isLeaving: false,
  error: null,
  transcription: '',
  isConnected: false,
  socket: null,
  webrtcStatus: null,
  localStream: null,
  remoteStream: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  leaveProgress: {
    step: '',
    message: '',
    isComplete: false
  }
};

// 리듀서 함수
function meetingReducer(state: MeetingState, action: MeetingAction): MeetingState {
  switch (action.type) {
    case 'SET_PIN':
      return { ...state, pin: action.payload };
    case 'SET_JOINING':
      return { ...state, isJoining: action.payload };
    case 'SET_JOINED':
      return { ...state, isJoined: action.payload };
    case 'SET_LEAVING':
      return { ...state, isLeaving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TRANSCRIPTION':
      return { ...state, transcription: action.payload };
    case 'APPEND_TRANSCRIPTION':
      return { ...state, transcription: state.transcription + action.payload };
    case 'CLEAR_TRANSCRIPTION':
      return { ...state, transcription: '' };
    case 'SET_CONNECTION_STATE':
      return { 
        ...state, 
        isConnected: action.payload.isConnected,
        socket: action.payload.socket,
        webrtcStatus: action.payload.webrtcStatus
      };
    case 'SET_MEDIA_STREAMS':
      return { 
        ...state, 
        localStream: action.payload.localStream,
        remoteStream: action.payload.remoteStream
      };
    case 'SET_AUDIO_ENABLED':
      return { ...state, isAudioEnabled: action.payload };
    case 'SET_VIDEO_ENABLED':
      return { ...state, isVideoEnabled: action.payload };
    case 'SET_LEAVE_PROGRESS':
      return { ...state, leaveProgress: action.payload };
    case 'RESET_STATE':
      return { ...initialState, pin: state.pin }; // PIN은 유지
    default:
      return state;
  }
}

// Context 타입 정의
interface MeetingContextType {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
  
  // 편의 함수들
  setPin: (pin: string) => void;
  setJoining: (isJoining: boolean) => void;
  setJoined: (isJoined: boolean) => void;
  setLeaving: (isLeaving: boolean) => void;
  setError: (error: string | null) => void;
  setTranscription: (text: string) => void;
  appendTranscription: (text: string) => void;
  clearTranscription: () => void;
  setConnectionState: (state: { isConnected: boolean; socket: any; webrtcStatus: any }) => void;
  setMediaStreams: (streams: { localStream: MediaStream | null; remoteStream: MediaStream | null }) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setLeaveProgress: (progress: { step: string; message: string; isComplete: boolean }) => void;
  resetState: () => void;
}

// Context 생성
const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

// Provider 컴포넌트
interface MeetingProviderProps {
  children: ReactNode;
  initialPin?: string;
}

export function MeetingProvider({ children, initialPin = '' }: MeetingProviderProps) {
  const [state, dispatch] = useReducer(meetingReducer, {
    ...initialState,
    pin: initialPin
  });

  // 편의 함수들
  const setPin = useCallback((pin: string) => {
    dispatch({ type: 'SET_PIN', payload: pin });
  }, []);

  const setJoining = useCallback((isJoining: boolean) => {
    dispatch({ type: 'SET_JOINING', payload: isJoining });
  }, []);

  const setJoined = useCallback((isJoined: boolean) => {
    dispatch({ type: 'SET_JOINED', payload: isJoined });
  }, []);

  const setLeaving = useCallback((isLeaving: boolean) => {
    dispatch({ type: 'SET_LEAVING', payload: isLeaving });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setTranscription = useCallback((text: string) => {
    dispatch({ type: 'SET_TRANSCRIPTION', payload: text });
  }, []);

  const appendTranscription = useCallback((text: string) => {
    dispatch({ type: 'APPEND_TRANSCRIPTION', payload: text });
  }, []);

  const clearTranscription = useCallback(() => {
    dispatch({ type: 'CLEAR_TRANSCRIPTION' });
  }, []);

  const setConnectionState = useCallback((connectionState: { isConnected: boolean; socket: any; webrtcStatus: any }) => {
    dispatch({ type: 'SET_CONNECTION_STATE', payload: connectionState });
  }, []);

  const setMediaStreams = useCallback((streams: { localStream: MediaStream | null; remoteStream: MediaStream | null }) => {
    dispatch({ type: 'SET_MEDIA_STREAMS', payload: streams });
  }, []);

  const setAudioEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUDIO_ENABLED', payload: enabled });
  }, []);

  const setVideoEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_VIDEO_ENABLED', payload: enabled });
  }, []);

  const setLeaveProgress = useCallback((progress: { step: string; message: string; isComplete: boolean }) => {
    dispatch({ type: 'SET_LEAVE_PROGRESS', payload: progress });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const value: MeetingContextType = {
    state,
    dispatch,
    setPin,
    setJoining,
    setJoined,
    setLeaving,
    setError,
    setTranscription,
    appendTranscription,
    clearTranscription,
    setConnectionState,
    setMediaStreams,
    setAudioEnabled,
    setVideoEnabled,
    setLeaveProgress,
    resetState
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
}

// Context 사용을 위한 커스텀 훅
export function useMeeting() {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
} 