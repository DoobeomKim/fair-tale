'use client';

import React, { useState, useEffect } from 'react';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';

interface AudioInputProps {
  stream: MediaStream | null;
  roomId: string;
  language?: string;
  socket?: any;
  isConnected?: boolean;
  onTranscriptionReceived?: (text: string) => void;
}

export function AudioInput({ 
  stream, 
  roomId,
  language = 'ko-KR',
  socket,
  isConnected,
  onTranscriptionReceived 
}: AudioInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [userClickedStart, setUserClickedStart] = useState(false);

  const { 
    isProcessing, 
    volume, 
    error: audioError, 
    isInitialized, 
    userInteracted,
    startProcessing,
    stopProcessing,
    setUserInteractionManually
  } = useAudioProcessor({
    roomId,
    stream,
    language,
    socket,
    isConnected,
    isEnabled: !!stream && userClickedStart,
    onTranscriptionReceived,
    onError: (err) => setError(err.message)
  });

  // 에러 상태 통합
  const currentError = error || audioError?.message || null;

  useEffect(() => {
    if (currentError) {
      console.error('🚨 AudioInput 에러:', currentError);
    }
  }, [currentError]);

  // 오디오 시작 버튼 핸들러
  const handleStartAudio = async () => {
    try {
      console.log('👆 사용자가 오디오 시작 버튼 클릭');
      
      // 1. 사용자 상호작용 수동 설정
      setUserInteractionManually();
      
      // 2. 컴포넌트 상태 업데이트
      setUserClickedStart(true);
      setError(null);
      
      // 3. 짧은 딜레이 후 오디오 처리 시작 (ref 업데이트 완료 보장)
      setTimeout(async () => {
        try {
          await startProcessing();
        } catch (err) {
          console.error('❌ 오디오 시작 실패:', err);
          setError(err instanceof Error ? err.message : '오디오 시작에 실패했습니다');
        }
      }, 10); // 100ms에서 10ms로 단축
      
    } catch (err) {
      console.error('❌ 오디오 시작 실패:', err);
      setError(err instanceof Error ? err.message : '오디오 시작에 실패했습니다');
    }
  };

  // 오디오 중지 버튼 핸들러
  const handleStopAudio = () => {
    console.log('👆 사용자가 오디오 중지 버튼 클릭');
    setUserClickedStart(false);
    stopProcessing();
  };

  // 렌더링
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">음성 인식</h3>
      
      {/* 스트림 상태 */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${stream ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            마이크: {stream ? '연결됨' : '연결 안됨'}
          </span>
        </div>
      </div>

      {/* 오디오 컨트롤 버튼 */}
      <div className="mb-4">
        {!isInitialized ? (
          <div className="text-center">
            {userClickedStart ? (
              <div className="text-blue-600">
                🔧 오디오 시스템 초기화 중...
              </div>
            ) : (
              <button
                onClick={handleStartAudio}
                disabled={!stream}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                🎤 음성 인식 시작
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isProcessing ? (
              <button
                onClick={handleStopAudio}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                🛑 음성 인식 중지
              </button>
            ) : (
              <button
                onClick={handleStartAudio}
                disabled={!stream}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ▶️ 음성 인식 시작
              </button>
            )}
          </div>
        )}
      </div>

      {/* 볼륨 표시 */}
      {isProcessing && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">볼륨:</span>
            <div className="flex-1 bg-gray-200 h-2 rounded">
              <div 
                className="bg-green-500 h-2 rounded transition-all duration-100"
                style={{ width: `${Math.min(volume * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{(volume * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* 상태 정보 */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>사용자 상호작용: {userInteracted ? '✅' : '❌'}</div>
        <div>초기화: {isInitialized ? '✅' : '❌'}</div>
        <div>처리 중: {isProcessing ? '✅' : '❌'}</div>
        <div>언어: {language}</div>
      </div>

      {/* 에러 표시 */}
      {currentError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {currentError}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
} 