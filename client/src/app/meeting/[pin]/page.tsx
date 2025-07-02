'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

export default function MeetingRoom() {
  const params = useParams();
  const pin = params.pin as string;
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // TODO: Step 2에서 구현될 WebSocket 연결 로직
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isConnecting) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">연결 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            미팅 룸 #{pin}
          </h1>
          <button
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            onClick={() => window.history.back()}
          >
            나가기
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">내 비디오</p>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">상대방 비디오</p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-7xl mx-auto flex justify-center space-x-4">
            <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">
              마이크
            </button>
            <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">
              카메라
            </button>
            <button className="p-3 rounded-full bg-red-100 hover:bg-red-200 text-red-600">
              종료
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 