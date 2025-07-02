'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000');

export default function MeetingPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 소켓 이벤트 리스너 설정
    socket.on('error', (message: string) => {
      setError(message);
      setIsLoading(false);
    });

    socket.on('room-full', () => {
      setError('이미 2명의 사용자가 참여 중입니다.');
      setIsLoading(false);
    });

    socket.on('room-joined', () => {
      router.push(`/meeting/${pin}`);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      socket.off('error');
      socket.off('room-full');
      socket.off('room-joined');
    };
  }, [pin, router]);

  const validatePin = (value: string) => {
    return /^\d{4}$/.test(value);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePin(pin)) {
      setError('PIN은 4자리 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // 서버에 룸 참가 요청
    socket.emit('join-room', pin);
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          미팅 입장
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
              4자리 PIN 번호
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="pin"
                value={pin}
                onChange={handlePinChange}
                placeholder="0000"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                maxLength={4}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || pin.length !== 4}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '입장 중...' : '입장하기'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
} 