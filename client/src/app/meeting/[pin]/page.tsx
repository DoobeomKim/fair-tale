'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { MeetingProvider } from '@/contexts/MeetingContext';
import MeetingRoom from '@/components/meeting/MeetingRoom';

interface PageProps {
  params: Promise<{ pin: string }>;
}

const VALID_PIN = '0707';

export default function Page({ params }: PageProps) {
  const { pin } = use(params);
  const searchParams = useSearchParams();
  
  // URL 파라미터에서 내 언어 설정 읽기
  const myLanguage = searchParams.get('myLang') || 'ko-KR';
  
  // PIN이 유효하지 않으면 에러 표시
  if (pin !== VALID_PIN) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-red-600">잘못된 PIN</h1>
        <p className="text-center text-gray-600 mb-4">
          유효하지 않은 PIN 번호입니다: {pin}
        </p>
        <div className="text-center">
          <a 
            href="/meeting" 
            className="text-blue-500 hover:text-blue-600 underline"
          >
            다시 시도하기
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <MeetingProvider initialPin={pin}>
      <MeetingRoom 
        pin={pin} 
        myLanguage={myLanguage}
      />
    </MeetingProvider>
  );
} 