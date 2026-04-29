'use client';

import React, { useState } from 'react';
import { useRouting } from '@/hooks/useRouting';
import MainLayout from '@/components/layout/MainLayout';

const VALID_PIN = '0707';

// 지원 언어 목록 (서버와 동일)
type LanguageCode = 'ko-KR' | 'en-US' | 'ja-JP' | 'zh-CN' | 'es-ES' | 'fr-FR' | 'de-DE';

const SUPPORTED_LANGUAGES: Record<LanguageCode, { name: string; code: string; flag: string }> = {
  'ko-KR': {
    name: '한국어',
    code: 'ko-KR',
    flag: '🇰🇷'
  },
  'en-US': {
    name: 'English (US)',
    code: 'en-US',
    flag: '🇺🇸'
  },
  'ja-JP': {
    name: '日本語',
    code: 'ja-JP',
    flag: '🇯🇵'
  },
  'zh-CN': {
    name: '中文 (简体)',
    code: 'zh-CN',
    flag: '🇨🇳'
  },
  'es-ES': {
    name: 'Español',
    code: 'es-ES',
    flag: '🇪🇸'
  },
  'fr-FR': {
    name: 'Français',
    code: 'fr-FR',
    flag: '🇫🇷'
  },
  'de-DE': {
    name: 'Deutsch',
    code: 'de-DE',
    flag: '🇩🇪'
  }
};

export default function MeetingPage() {
  const { navigateToMeetingRoom, isInMeetingRoom } = useRouting();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [myLanguage, setMyLanguage] = useState<LanguageCode>('ko-KR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!pin || pin.length !== 4) {
      setError('PIN 번호는 4자리여야 합니다.');
      return;
    }

    if (pin !== VALID_PIN) {
      setError('유효하지 않은 PIN 번호입니다.');
      return;
    }

    setIsLoading(true);
    
    // 내 언어 설정만 포함한 쿼리 파라미터 생성
    const languageParams = new URLSearchParams({
      myLang: myLanguage
    });
    
    // 안전한 네비게이션 사용
    const success = navigateToMeetingRoom(pin, {
      onBefore: () => {
        console.log('🚀 미팅룸 입장 준비 중...');
        console.log(`🗣️ 내 언어: ${SUPPORTED_LANGUAGES[myLanguage].name}`);
      },
      onAfter: () => {
        console.log('✅ 미팅룸 페이지로 이동 완료');
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('❌ 페이지 이동 실패:', error);
        setError('페이지 이동 중 오류가 발생했습니다.');
        setIsLoading(false);
      },
      queryParams: languageParams.toString()
    });

    // 중복 네비게이션이 방지된 경우
    if (!success) {
      setIsLoading(false);
      if (isInMeetingRoom(pin)) {
        setError('이미 해당 미팅룸에 있습니다.');
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Fair-Tale</h1>
        <p className="text-center text-gray-600 mb-6">실시간 음성 번역 화상회의</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              4자리 PIN 번호
            </label>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="0707"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* 내 언어 선택 */}
          <div>
            <label htmlFor="myLanguage" className="block text-sm font-medium text-gray-700 mb-2">
              🗣️ 내 언어
            </label>
            <select
              id="myLanguage"
              value={myLanguage}
              onChange={(e) => setMyLanguage(e.target.value as LanguageCode)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">내가 말할 언어를 선택하세요</p>
          </div>

          {/* 번역 안내 */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">번역 시스템</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>내가 <strong>{SUPPORTED_LANGUAGES[myLanguage].name}</strong>로 말하면 상대방 언어로 번역됩니다</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>상대방이 말하면 <strong>{SUPPORTED_LANGUAGES[myLanguage].name}</strong>로 번역됩니다</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600">상대방 언어는 상대방이 입장할 때 자동으로 설정됩니다</span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? '입장 중...' : '입장하기'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
} 