import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket';

interface TestResult {
  scenario: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface TestScenario {
  name: string;
  run: () => Promise<void>;
}

export const useSocketTester = (roomId: string) => {
  const { socket } = useSocket();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scenariosRef = useRef<TestScenario[]>([]);

  // 테스트 결과 기록
  const logResult = (scenario: string, success: boolean, error?: string) => {
    setResults(prev => [...prev, {
      scenario,
      success,
      error,
      timestamp: Date.now()
    }]);
  };

  // 기본 연결 테스트 시나리오들
  const basicTests: TestScenario[] = [
    {
      name: '정상 입장',
      run: async () => {
        return new Promise((resolve, reject) => {
          if (!socket) {
            reject(new Error('Socket not initialized'));
            return;
          }

          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for join response'));
          }, 5000);

          socket.once('join-room-success', () => {
            clearTimeout(timeout);
            resolve();
          });

          socket.once('join-room-error', (error) => {
            clearTimeout(timeout);
            reject(new Error(error.message));
          });

          socket.emit('join-room', { roomId });
        });
      }
    },
    {
      name: '잘못된 PIN 테스트',
      run: async () => {
        return new Promise((resolve, reject) => {
          if (!socket) {
            reject(new Error('Socket not initialized'));
            return;
          }

          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for error response'));
          }, 5000);

          socket.once('join-room-error', () => {
            clearTimeout(timeout);
            resolve();
          });

          socket.once('join-room-success', () => {
            clearTimeout(timeout);
            reject(new Error('Should not succeed with invalid PIN'));
          });

          socket.emit('join-room', { roomId: '0000' });
        });
      }
    }
  ];

  // 네트워크 불안정 테스트 시나리오들
  const networkTests: TestScenario[] = [
    {
      name: '재연결 테스트',
      run: async () => {
        return new Promise((resolve, reject) => {
          if (!socket) {
            reject(new Error('Socket not initialized'));
            return;
          }

          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for reconnection'));
          }, 10000);

          socket.once('connect', () => {
            clearTimeout(timeout);
            resolve();
          });

          socket.disconnect();
        });
      }
    }
  ];

  // 동시성 테스트 시나리오들
  const concurrencyTests: TestScenario[] = [
    {
      name: '빠른 입장/퇴장 반복',
      run: async () => {
        if (!socket) throw new Error('Socket not initialized');

        const attempts = 5;
        const results = [];

        for (let i = 0; i < attempts; i++) {
          try {
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Timeout'));
              }, 3000);

              socket.once('join-room-success', () => {
                clearTimeout(timeout);
                resolve(true);
              });

              socket.emit('join-room', { roomId });
            });
            
            socket.emit('leave-room', { roomId });
            results.push(true);
          } catch (error) {
            results.push(false);
          }
        }

        const successRate = results.filter(r => r).length / attempts;
        if (successRate < 0.8) {
          throw new Error(`Low success rate: ${successRate * 100}%`);
        }
      }
    }
  ];

  // 모든 테스트 시나리오 초기화
  useEffect(() => {
    scenariosRef.current = [
      ...basicTests,
      ...networkTests,
      ...concurrencyTests
    ];
  }, []);

  // 단일 테스트 실행
  const runTest = async (scenario: TestScenario) => {
    try {
      await scenario.run();
      logResult(scenario.name, true);
    } catch (error) {
      logResult(scenario.name, false, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // 모든 테스트 실행
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const scenario of scenariosRef.current) {
      await runTest(scenario);
      // 테스트 간 간격
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  // 특정 테스트만 실행
  const runSpecificTest = async (testName: string) => {
    const scenario = scenariosRef.current.find(s => s.name === testName);
    if (scenario) {
      setIsRunning(true);
      await runTest(scenario);
      setIsRunning(false);
    }
  };

  return {
    results,
    isRunning,
    runAllTests,
    runSpecificTest
  };
}; 
