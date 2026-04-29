'use client';

import React from 'react';

interface MeetingLobbyProps {
  pin: string;
  isJoining: boolean;
  isConnected: boolean;
  error: string | null;
  webrtcStatus: {
    isInitialized: boolean;
    hasMedia: boolean;
    isPeerConnected: boolean;
    error?: { message: string };
  } | null;
  onJoinRoom: () => void;
}

export function MeetingLobby({ 
  pin, 
  isJoining, 
  isConnected, 
  error, 
  webrtcStatus, 
  onJoinRoom 
}: MeetingLobbyProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Meeting Room</h1>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg mb-2">PIN: {pin}</p>
            <p className="text-sm text-gray-600 mb-2">
              소켓 연결: {isConnected ? '연결됨' : '연결 안됨'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              WebRTC 상태: {webrtcStatus?.isInitialized ? '초기화됨' : '초기화 중'} | 
              {webrtcStatus?.hasMedia ? ' 미디어 OK' : ' 미디어 없음'} | 
              {webrtcStatus?.isPeerConnected ? ' 연결됨' : ' 연결 대기'}
            </p>
            <button
              onClick={onJoinRoom}
              disabled={isJoining}
              className={`
                w-full py-2 px-4 rounded-md text-white font-medium
                ${isJoining
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'}
              `}
            >
              {isJoining ? '입장 중...' : '입장하기'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              카메라와 마이크 권한이 필요합니다
            </p>
          </div>
          {(error || webrtcStatus?.error) && (
            <div className="text-red-500 text-center mt-4 p-2 bg-red-50 rounded">
              {error || webrtcStatus?.error?.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 