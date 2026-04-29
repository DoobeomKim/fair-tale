## 2026-04 현재 구현 기준

현재 Fairtale MVP의 우선순위는 기존의 "실시간 음성통역 화상회의 완성"에서 "수출기업 대상 랜딩페이지와 제품 검토 요청 전환"으로 조정한다.

즉, 실시간 통역 기능은 `/meeting` 아래에 PoC 자산으로 보존하고, 메인 `/` 페이지는 Fairtale의 새로운 MVP 모델을 설명하고 공급 기업의 제품 검토 요청을 받는 랜딩페이지로 운영한다.

### 현재 MVP 구현 범위

| 영역 | 선택 | 설명 |
| --- | --- | --- |
| 메인 랜딩 | Next.js App Router | `/`에서 수출기업 대상 신청 전환 페이지 제공 |
| 스타일링 | Tailwind CSS + Pretendard | 별도 UI 라이브러리 없이 빠르게 구현 |
| 제목 웹폰트 | Noonnu `GyeongbokgungSumunjangTitle` + Google Fonts fallback | 대제목은 경복궁수문장 제목체, 보조 fallback은 `Chiron Sung HK` |
| 브랜드 자산 | SVG 로고 | `client/public/brand` 아래에서 관리 |
| 신청 흐름 | 정적 폼 UI 우선 | 초기에는 실제 제출 연동보다 전환 구조 검증을 우선 |
| 기존 화상회의 PoC | `/meeting` 유지 | PIN 기반 실시간 통역 회의 기능은 데모/기술 검증 자산으로 보존 |
| 백엔드 | Node.js + Express + Socket.IO | 기존 실시간 통신 서버 유지 |
| AI 번역 PoC | Google STT + DeepL + Google TTS | 상담 단계의 고도화 기능 후보로 유지 |

### 현재 우선순위

1. `/` 랜딩페이지를 Fairtale 컨셉과 디자인 원칙에 맞게 구현
2. 제품 검토 요청 폼의 실제 제출 처리 연결
3. 바이어용 별도 페이지 추가
4. 기존 `/meeting` PoC를 상담 단계 기능으로 정리
5. WebRTC signaling과 양방향 통역 안정화는 후순위 고도화로 진행

### 문서 기준

- 제품/브랜드 방향: `docs/concept.md`
- MVP 모델: `docs/mvp-model.md`
- 디자인 원칙: `docs/design-principles.md`
- 개발 상태 추적: `docs/mvp-development-checklist.md`

---

✅ 목표 기능:
양방향 실시간 화상/음성 대화 중 AI를 통한 1초 이내의 음성통역 출력

✅ 전체 구성도
[마이크 입력] 
 → [Speech-to-Text(STT)] 
 → [AI 번역] 
 → [Text-to-Speech(TTS)] 
 → [상대방에게 실시간 출력]

✅ 추천 기술스택 구성 (Web 기준)
기능
기술 선택지
추천 옵션
UI/프론트엔드
React / Next.js
✅ Next.js (SSR 및 빠른 빌드)
실시간 통신
WebRTC / Socket.IO
✅ WebRTC (화상+음성 통합)
STT (음성 → 텍스트)
Google STT, Whisper API, Azure STT
✅ Google Cloud Speech-to-Text (속도/정확도 우수)
번역 (텍스트 → 번역)
Google Translate, DeepL API, NLLB
✅ DeepL API (기술/비즈니스 분야 정확도 우수)
TTS (텍스트 → 음성)
Google TTS, Amazon Polly, Azure TTS
✅ Amazon Polly 또는 Google TTS
음성 송출 처리
Web Audio API
✅ Web Audio API (브라우저 오디오 출력 제어)
백엔드 처리
Node.js / Express.js
✅ Node.js (API 연동 처리 + WebRTC 시그널링 서버)
Render, Fly.io, Railway, Heroku 중
가장 배포 간단한 Railway 사용 예정.
프론트/호스팅/실험환경
Vercel / Render / Firebase
✅ Vercel (Next.js에 최적화)
인증/스토리지/DB


Supabase

✅ 기술스택 다시 정리 (Web 기준)

기능
추천 옵션
보충 설명
UI/프론트엔드
✅ Next.js (SSR 및 빠른 빌드)
SSR 지원, 페이지 기반 라우팅
CSS 디자인
✅ Tailwind CSS
유틸리티 기반 스타일링, 빠른 개발
실시간 통신
✅ WebRTC / Socket.IO
1:1 화상/음성 (Peer-to-peer 방식)
Socket.IO는 signaling 및 세션
STT (음성 → 텍스트)
✅ Google Cloud Speech-to-Text
Streaming 모드로 실시간 전사 가능
번역 (텍스트 → 번역)
✅ DeepL API
기술/비즈니스 분야에서 정확도 우수
TTS (텍스트 → 음성)
✅ Google Cloud Text-to-Speech
다양한 언어/성별/속도 선택 가능
음성 송출 처리
✅ Web Audio API (브라우저 오디오 출력 제어)
브라우저에서 오디오 재생 제어 및 큐 처리
백엔드 처리
✅ Node.js + Express
✅ Railway
Node.js로 signaling, API 중계 구현
Railway는 서버 배포 및 PostgreSQL DB 제공
호스팅/실험환경
✅ Vercel
Next.js 배포 최적화, 빠른 배포
인증/스토리지/DB
✅ Supabase
PostgreSQL, 이메일 로그인, 스토리지 지원
→ 기업정보, 채팅로그, 번역로그 저장 가능


✅ 동작 흐름 예시 (사용자 A → 사용자 B)
사용자 A가 마이크로 말함 (WebRTC로 음성 송출)
동시에, 음성 데이터는 Google STT로 전송되어 텍스트화
번역 API (예: DeepL)로 실시간 번역 처리
번역된 텍스트를 TTS API로 음성 합성
사용자 B에게 오디오로 전달 (Web Audio API 사용)
예상 응답 딜레이 (각 단위)
단계
평균 딜레이
비고
STT
0.5 ~ 0.8초
Google Cloud 기준
번역
0.1 ~ 0.3초
DeepL Pro 기준
TTS
0.2 ~ 0.4초
Google 또는 Polly
총합
약 0.8~1.3초
최적화 시 1초 내외 가능

✅ 개발을 시작할 때 필요한 주요 작업
✅ Google Cloud / DeepL / Amazon Polly API Key 발급
✅ WebRTC 예제 코드 베이스 확보 (Daily, Agora, 자체 구현)
✅ 마이크 입력 스트리밍 + 음성 분할 → STT 연동
✅ 비동기 처리 기반 파이프라인 구성 (STT → 번역 → TTS → Play)
✅ 오디오 싱크/중복 방지 처리 (Web Audio API로 큐 관리)

✅ 참고 오픈소스/레퍼런스
Google Cloud Real-time Streaming STT Docs
DeepL API Docs
WebRTC Example with Transcription
