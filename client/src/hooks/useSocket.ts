import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// 연결 설정 상수
const SOCKET_SERVER_URL = 'http://localhost:4000'; // 기존 서버로 변경
const SOCKET_CONNECTION_TIMEOUT = 15000;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null); // state로 변경
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(false);

  // 소켓 연결 함수
  const connect = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      console.log('🚀 Socket connection attempt started...');
      console.log('Target server URL:', SOCKET_SERVER_URL);
      
      // 이미 연결된 경우
      if (socketRef.current?.connected) {
        console.log('✅ Socket is already connected');
        resolve();
        return;
      }

      // 기존 소켓 정리
      if (socketRef.current) {
        console.log('🧹 Cleaning up existing socket...');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      try {
        // 새 소켓 인스턴스 생성 - 최대한 간단한 설정
        console.log('🔧 Creating new socket instance...');
        console.log('🔧 Socket.IO configuration:', {
          url: SOCKET_SERVER_URL,
          transports: ['polling'], // polling만 사용
          timeout: SOCKET_CONNECTION_TIMEOUT,
          forceNew: true
        });
        
        socketRef.current = io(SOCKET_SERVER_URL, {
          autoConnect: false,
          forceNew: true,
          transports: ['polling', 'websocket'], // polling을 먼저 시도
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 2000
        });

        const socketInstance = socketRef.current;
        setSocket(socketInstance); // state 업데이트
        let isResolved = false;

        // 연결 성공 핸들러
        const handleConnect = () => {
          console.log('✅ Socket connected successfully');
          console.log('Socket ID:', socketInstance.id);
          console.log('Transport:', socketInstance.io.engine.transport.name);
          
          if (mountedRef.current) {
            setSocket(socketInstance); // 연결 성공 시 state 업데이트
            setIsConnected(true);
            setError(null);
          }
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve();
          }
        };

        // 연결 에러 핸들러
        const handleConnectError = (err: any) => {
          console.error('❌ Socket connection error:', err);
          console.error('Error details:', {
            message: err.message,
            type: err.type,
            description: err.description,
            context: err.context,
            transport: err.transport
          });
          
          const errorMessage = `연결 실패: ${err.message || err.description || '알 수 없는 오류'}`;
          if (mountedRef.current) {
            setSocket(null); // 연결 실패 시 state 초기화
            setError(errorMessage);
            setIsConnected(false);
          }
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(new Error(errorMessage));
          }
        };

        // 연결 해제 핸들러
        const handleDisconnect = (reason: string) => {
          console.log('🔌 Socket disconnected:', reason);
          if (mountedRef.current) {
            setSocket(null); // 연결 해제 시 state 초기화
            setIsConnected(false);
          }
        };

        // 타임아웃 핸들러
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            const errorMessage = '연결 시간 초과';
            console.error('⏰ Connection timeout after', SOCKET_CONNECTION_TIMEOUT, 'ms');
            if (mountedRef.current) {
              setSocket(null); // 타임아웃 시 state 초기화
              setError(errorMessage);
              setIsConnected(false);
            }
            reject(new Error(errorMessage));
          }
        }, SOCKET_CONNECTION_TIMEOUT);

        // 이벤트 리스너 등록
        socketInstance.on('connect', handleConnect);
        socketInstance.on('connect_error', handleConnectError);
        socketInstance.on('disconnect', handleDisconnect);
        
        // 추가 디버깅 이벤트
        socketInstance.io.on('error', (err) => {
          console.error('🔥 Socket.IO engine error:', err);
        });
        
        socketInstance.io.on('open', () => {
          console.log('🔓 Socket.IO engine opened');
        });
        
        socketInstance.io.on('close', (reason) => {
          console.log('🔒 Socket.IO engine closed:', reason);
        });

        // 연결 시도
        console.log('🔗 Attempting to connect to:', SOCKET_SERVER_URL);
        console.log('🔗 Socket state before connect:', socketInstance.connected);
        
        // 실제 연결 시도
        socketInstance.connect();
        
        console.log('🔗 Socket state after connect:', socketInstance.connected);
        console.log('🔗 Socket engine ready state:', socketInstance.io.engine?.readyState);

      } catch (err) {
        console.error('💥 Socket initialization error:', err);
        const errorMessage = `초기화 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`;
        if (mountedRef.current) {
          setSocket(null); // 초기화 실패 시 state 초기화
          setError(errorMessage);
          setIsConnected(false);
        }
        reject(new Error(errorMessage));
      }
    });
  }, []);

  // 소켓 연결 해제 함수
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting socket...');
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null); // state 초기화
    }
    if (mountedRef.current) {
      setIsConnected(false);
      setError(null);
    }
  }, []);

  // 이벤트 리스너 등록 함수
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      console.log(`📡 Event listener registered: ${event}`);
    } else {
      console.warn('⚠️ Cannot register event listener - socket not available:', event);
    }
  }, []);

  // 이벤트 발생 함수
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 Emitted event: ${event}`, data);
    } else {
      console.warn('⚠️ Socket is not connected. Cannot emit event:', event);
    }
  }, []);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    mountedRef.current = true;
    console.log('🔧 useSocket mounted');

    return () => {
      mountedRef.current = false;
      console.log('🔧 useSocket unmounting...');
      disconnect();
    };
  }, [disconnect]);

  return {
    socket, // state로 변경된 socket 반환
    isConnected,
    error,
    connect,
    disconnect,
    on,
    emit
  };
}; 