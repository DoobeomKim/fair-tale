'use client';

import React from 'react';
import { VideoStream } from '@/components/video/VideoStream';
import { AudioInput } from '@/components/audio/AudioInput';
import { TranscriptionDisplay } from '@/components/audio/TranscriptionDisplay';

interface MeetingSpaceProps {
  pin: string;
  isLeaving: boolean;
  transcription: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  myLanguage?: string;
  socket?: any;
  isConnected?: boolean;
  leaveProgress: {
    step: string;
    message: string;
    isComplete: boolean;
  };
  onLeaveRoom: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onTranscriptionReceived: (text: string) => void;
}

export function MeetingSpace({
  pin,
  isLeaving,
  transcription,
  localStream,
  remoteStream,
  isAudioEnabled,
  isVideoEnabled,
  myLanguage = 'ko-KR',
  socket,
  isConnected,
  leaveProgress,
  onLeaveRoom,
  onToggleAudio,
  onToggleVideo,
  onTranscriptionReceived
}: MeetingSpaceProps) {
  return (
    <div className="container mx-auto p-4">
      {/* 헤더 - 룸 정보 및 나가기 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Meeting Room: {pin}</h1>
          <p className="text-sm text-gray-600">
            🗣️ 내 언어: {myLanguage}
          </p>
        </div>
        <button
          onClick={onLeaveRoom}
          disabled={isLeaving}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
            isLeaving
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isLeaving ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              나가는 중...
            </>
          ) : (
            '나가기'
          )}
        </button>
      </div>

      {/* 비디오 스트림 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <h3 className="text-white p-2 bg-gray-800">내 화면</h3>
          {localStream && (
            <VideoStream
              pin={pin}
              stream={localStream}
              muted={true}
            />
          )}
        </div>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <h3 className="text-white p-2 bg-gray-800">상대방 화면</h3>
          {remoteStream && (
            <VideoStream
              pin={pin}
              stream={remoteStream}
              muted={false}
            />
          )}
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={onToggleAudio}
          className={`px-4 py-2 rounded-md ${
            isAudioEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isAudioEnabled ? '🎤 음소거 해제' : '🎤 음소거'}
        </button>
        <button
          onClick={onToggleVideo}
          className={`px-4 py-2 rounded-md ${
            isVideoEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isVideoEnabled ? '📹 비디오 켜짐' : '📹 비디오 꺼짐'}
        </button>
      </div>

      {/* 오디오 입력 및 자막 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-2">음성 입력</h3>
          <AudioInput 
            stream={localStream}
            roomId={pin}
            language={myLanguage}
            socket={socket}
            isConnected={isConnected}
            onTranscriptionReceived={onTranscriptionReceived}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-2">실시간 번역 자막</h3>
          <TranscriptionDisplay 
            key={`transcription-${pin}`}
            roomId={pin} 
            socket={socket}
            isConnected={isConnected}
          />
        </div>
      </div>

      {/* 나가기 진행 상황 모달 */}
      {isLeaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">회의에서 나가는 중...</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm">{leaveProgress.step}</span>
              </div>
              <p className="text-sm text-gray-600">{leaveProgress.message}</p>
              {leaveProgress.isComplete && (
                <p className="text-sm text-green-600">✅ 완료</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 