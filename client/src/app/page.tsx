import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Fair-Tale K-D Biz Match
      </h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        B2B 온라인 전시·박람회·제품 기술 매칭 플랫폼에서 실시간 통역 화상회의를 경험해보세요.
      </p>
      <Link 
        href="/meeting" 
        className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
      >
        데모 시작하기
      </Link>
    </div>
  );
}
