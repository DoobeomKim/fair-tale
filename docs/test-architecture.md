✅ 현재 제안한 MVP 웹 구조 요약
사용자가 홈페이지에 접속 → 4자리 비밀번호 입력 → 1:1 화상통역 방에 입장 → 실시간 음성/자막/번역 + 음성 송출
단계
기능
비고
홈페이지 접속
Next.js 기반 라우팅
ex. /demo 또는 /meeting
비밀번호 입력
전역 공유 4자리 비밀번호
단순 세션 보호용 (임시)
입장 제한
2인까지만 입장 가능하도록 서버에서 방 제한
WebSocket 기반 세션 관리 필요
대화방 입장
화상화면 + 자막 + TTS 출력 영역
핵심 UI

→ 이 구조로 하면 개발자의 리소스를 아끼면서도, 실제 "양방향 통역" 경험을 테스트 가능

✅ 기능 구조 및 추천 기술
1. 입장 인증 / 룸 세팅
항목
구현 방식
비고
4자리 PIN 입력
React 입력 폼 + 상태 저장
/demo 라우트로 진입 후 → 입력
세션/룸 구성
WebSocket 서버에서 룸 생성 (1방당 2명 제한)
socket.io rooms 추천
입장 인원 체크
입장 시마다 서버가 룸 인원 카운트
2명 초과 시 입장 거부 메시지

✅ 이 단계까지는 로그인 불필요 — 테스트 MVP로 충분

2. 화상 통신 + 오디오 스트리밍
항목
기술
비고
영상/음성 스트리밍
simple-peer (WebRTC) + socket.io로 signaling
Peer-to-peer 방식으로 최소 딜레이
비디오 UI
React 컴포넌트 (내 화면, 상대 화면)
<video autoPlay playsInline />

3. 음성 입력 → 실시간 번역 → TTS 송출
단계
설명
기술
A의 마이크 → 음성 수집
브라우저에서 마이크 캡처
MediaRecorder 또는 Web Audio API
음성 chunk → 서버로 전송
WebSocket으로 1초 단위 audio blob 송신
연결 안정성 고려
STT 변환
Google Cloud Speech-to-Text (Streaming)
Node.js에서 처리
번역
DeepL API (단문 위주)
서버에서 한쪽으로만 호출
TTS
Google TTS / Polly
TTS 결과는 mp3 또는 audio buffer로 반환
상대방에게 전송
WebSocket으로 재생 명령 전달
브라우저에서 Audio 재생

🎯 실시간성 유지: 전체 흐름을 1~1.3초 이내로 맞추려면 각 파이프라인이 비동기로 큐 처리되어야 함.

✅ UI 구조 제안 (MVP 시점)
┌────────────── UI ──────────────┐
│ [내 영상]    [상대방 영상]       │
│ 자막: "번역된 문장 표시 영역"     │
│                                │
│ 음성 재생 [ON/OFF] 토글 버튼     │
│ 마이크 입력 상태 [● ON]          │
│ 세션 종료 버튼                    │
└─────────────────────────────┘

✅ 추가 아이디어: 아직 미정인 부분 가이드
입장 후 필요한 세팅 관련해서는 다음과 같은 초기화 흐름을 추천합니다:
항목
설명
언어 선택
입장 시: "내 언어 / 상대 언어" 선택 (ex. 한국어 ↔ 독일어)
TTS 음성 선택
성별, 속도 선택 옵션 (선택 사항)
자막 표시 방식
자막 자동 출력 / 클릭 시 보기 (토글 가능)
번역 데이터 로그
클라이언트 로컬에 번역된 텍스트 저장 여부 (기록용)





사용자 로그인
Firebase Auth 또는 Supabase Auth


다국어 UI
next-i18next 라이브러리


실시간 자막만 표시
STT+번역까지만 사용하고 TTS는 OFF 상태


미팅 요약 저장
번역 로그를 PDF로 요약 저장 (html2pdf.js 등 활용)



✅ 결론: 이 구조의 강점
빠른 테스트 및 시연 가능 (1~2주면 기본 MVP 구축 가능)


사용자 입장에선 복잡한 설정 없이 ‘들어가서 대화’만 하면 됨


이후 기업 매칭 구조, 사용자 인증, 다국어 TTS 등 확장 가능

✅ MVP 테스트 웹 구축 단계별 진행 순서 (v0.1 기준)
🔹 Step 0. 개발 환경 준비
작업
설명
GitHub 저장소 생성
클라이언트(Next.js) + 백엔드(Node.js) 분리 가능
Railway 프로젝트 생성
Node.js 백엔드 서버 배포용
Google Cloud API 설정
STT / TTS 키 발급 (Node.js에서 사용)
DeepL API 키 발급
무료 또는 Pro 플랜 키 준비
Supabase 프로젝트 생성
향후 로그 저장, 사용자 인증용 (v0.1에선 사용 X도 가능)


🔹 Step 1. 기본 프론트엔드 라우팅 + 인증
작업
설명
/ 페이지
소개 / 버튼 클릭 시 /meeting으로 이동
/meeting 페이지
4자리 PIN 입력창 구성
PIN 검증 및 상태 저장
클라이언트에서 상태 관리 (예: React useState)
WebSocket 연결
PIN 입력 성공 시 socket.io 클라이언트 연결 시작


🔹 Step 2. WebSocket 서버 구성 (Node.js + socket.io)
작업
설명
socket.io 설치 및 설정
Railway 서버에 Node.js + socket.io 배포
Room 생성 및 입장 관리
2인까지만 입장 가능한 구조 (socket.join(roomId))
입장 인원 체크
입장 시 인원 수 카운트 → 2명 초과 시 거부 이벤트 발생


🔹 Step 3. WebRTC 연결 (simple-peer 활용)
작업
설명
simple-peer 설치
Peer-to-peer 화상 연결용
signaling 구현
WebSocket 통해 peer 연결 정보 교환 (offer/answer 등)
영상 송출 UI 구현
<video autoPlay playsInline muted /> 구성 (내 화면/상대방 화면)
미디어 디바이스 접근
navigator.mediaDevices.getUserMedia() 사용


🔹 Step 4. 마이크 입력 → 실시간 번역 → TTS 송출
작업
설명
마이크 입력 캡처
MediaRecorder 또는 Web Audio API 활용
음성 chunk WebSocket 전송
매 1초 단위 오디오 blob을 Node.js 서버로 전송
STT 처리 (서버)
Google Cloud Speech-to-Text API로 변환 (Streaming)
번역 처리
번역된 텍스트를 DeepL API로 전송
TTS 처리
Google TTS로 변환된 오디오 buffer 생성
상대방에 전송
WebSocket 통해 번역 텍스트 + 오디오 URL 또는 buffer 전송
브라우저에서 재생
Web Audio API로 큐 재생 (오디오 충돌 방지 처리)


🔹 Step 5. UI 구성 및 테스트 기능
작업
설명
실시간 자막 출력
자막 영역에 번역 결과 출력 (React state 관리)
음성 출력 토글
재생 여부 사용자 설정 가능 (ON/OFF 버튼)
마이크 상태 표시
ON/OFF 상태 UI로 표시 (● ON 등)
세션 종료
퇴장 처리 및 영상 종료 처리


🔹 Step 6. MVP 데모용 세팅
작업
설명
초기 화면 구성 스타일링
TailwindCSS 기반 UI 마무리
테스트 전용 4자리 PIN 고정값
예: 1234 등
ngrok 또는 실제 도메인 사용
HTTPS 보장된 상태에서 WebRTC 동작 확인 필수
2기기 접속 시나리오 테스트
두 개의 브라우저(노트북+모바일 등)에서 접속해 실시간 번역 흐름 확인


✅ 예상 개발 시간 가이드 (1~2인 개발자 기준)
단계
기간(대략)
Step 1~2 (입장 + WebSocket)
1일
Step 3 (화상 연결)
1~2일
Step 4 (STT → 번역 → TTS)
2~3일
Step 5~6 (UI 마무리 + 테스트)
1~2일


✅ 보너스: 개발 디렉토리 구조 예시
project-root/
├── client/            ← Next.js 앱 (Vercel)
│   └── pages/
│       └── index.tsx
│       └── meeting.tsx
│   └── components/
│   └── styles/
│
├── server/            ← Node.js + socket.io 서버 (Railway)
│   └── index.js
│   └── stt.js
│   └── tts.js
│   └── translator.js
│
├── .env.local         ← API 키들

