import React from 'react';
import { useSocketTester } from '../hooks/useSocketTester';

interface SocketTesterProps {
  roomId: string;
}

export const SocketTester: React.FC<SocketTesterProps> = ({ roomId }) => {
  const { results, isRunning, runAllTests, runSpecificTest } = useSocketTester(roomId);

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
      <h3 className="text-lg font-semibold mb-4">소켓 연결 테스터</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => runAllTests()}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          모든 테스트 실행
        </button>
        
        <button
          onClick={() => runSpecificTest('정상 입장')}
          disabled={isRunning}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          입장 테스트
        </button>
        
        <button
          onClick={() => runSpecificTest('재연결 테스트')}
          disabled={isRunning}
          className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          재연결 테스트
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">시나리오</th>
              <th className="text-left py-2">결과</th>
              <th className="text-left py-2">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{result.scenario}</td>
                <td className="py-2">
                  {result.success ? (
                    <span className="text-green-500">성공</span>
                  ) : (
                    <span className="text-red-500" title={result.error}>실패</span>
                  )}
                </td>
                <td className="py-2 text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isRunning && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}; 