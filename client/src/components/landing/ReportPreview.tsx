'use client';

import * as React from 'react';

type ReportSectionId = 'intro' | 'points' | 'buyers' | 'checklist';

const reportSections = [
  { id: 'intro', number: '01', title: '영문 제품 소개' },
  { id: 'points', number: '02', title: '판매 포인트' },
  { id: 'buyers', number: '03', title: '추천 바이어 유형' },
  { id: 'checklist', number: '04', title: '상담 준비 체크리스트' },
] satisfies Array<{ id: ReportSectionId; number: string; title: string }>;

const salesPointRows = [
  {
    point: '접이식 보관 구조',
    reason: '배송 부피와 보관 공간을 줄여 온라인 판매와 소형 리테일 채널에 적합',
    prep: '접이부 반복 사용 내구성 자료',
  },
  {
    point: '스테인리스 소재',
    reason: '재사용, 플라스틱 절감 메시지로 친환경 주방용품 카테고리와 연결',
    prep: '식품 접촉 소재 인증 또는 소재 등급 정보',
  },
  {
    point: 'K-food 도시락 문화',
    reason: '한식/K-culture 콘텐츠와 연결해 선물 세트와 시즌 프로모션 제안 가능',
    prep: '김밥 전용이 아닌 lunchbox/meal prep 용도로 확장 설명',
  },
  {
    point: '컴팩트 패키지',
    reason: '마켓플레이스, 구독박스, 편집몰 테스트 판매 단위로 제안 가능',
    prep: '패키지 사이즈, 무게, MOQ, 세트 구성 정보',
  },
] satisfies Array<{ point: string; reason: string; prep: string }>;

const recommendedBuyerTypes = [
  {
    rank: '1순위',
    title: '온라인 라이프스타일 편집몰',
    reason: '제품 사진과 스토리텔링이 잘 맞고 K-food/K-lifestyle 테마 상품으로 테스트 판매하기 좋습니다.',
    point: '패키지 이미지 · 상세페이지 · 소량 MOQ',
  },
  {
    rank: '2순위',
    title: '주방용품 전문 온라인 리테일러',
    reason: 'lunchbox, meal prep, reusable kitchenware 카테고리로 이해시키기 쉽습니다.',
    point: '소재 인증 · 내구성 · 식기세척기 사용 여부',
  },
  {
    rank: '3순위',
    title: 'K-food / 아시안 식품 큐레이션샵',
    reason: '김밥, 도시락, 한식 문화와 연결해 콘텐츠형 상품으로 제안 가능합니다.',
    point: '레시피 콘텐츠 · 선물 세트 · 시즌 프로모션',
  },
] satisfies Array<{ rank: string; title: string; reason: string; point: string }>;

const lowerPriorityBuyerTypes = [
  {
    title: '대형 마트 본사 바이어',
    reason: '초기 브랜드 인지도, 공급 물량, 인증 자료 장벽이 높음',
  },
  {
    title: '저가 생활용품 도매상',
    reason: '가격 경쟁 중심 채널에서는 K-lifestyle 스토리와 소재 장점이 약해짐',
  },
] satisfies Array<{ title: string; reason: string }>;

const checklistColumns = [
  {
    title: '바이어가 물어볼 질문',
    tone: 'default',
    items: [
      'MOQ는 얼마인가요?',
      '샘플 발송이 가능한가요?',
      '납기와 월 공급 가능 수량은 어느 정도인가요?',
      '식품 접촉 소재 인증이 있나요?',
      '패키지 현지화가 가능한가요?',
    ],
  },
  {
    title: '상담 전 준비 자료',
    tone: 'default',
    items: [
      '영문 제품 소개서',
      '제품 사진 / 사용 장면 이미지',
      '가격표 또는 견적 기준',
      '패키지 사이즈 / 무게',
      '소재 정보 / 인증 자료',
      '샘플 정책',
    ],
  },
  {
    title: '확인 필요한 리스크',
    tone: 'risk',
    items: [
      '김밥 전용 제품으로만 보이면 시장이 좁아질 수 있음',
      '식품 접촉 소재 인증이 없으면 일부 상담이 제한될 수 있음',
      'MOQ가 높으면 테스트 판매 바이어에게 부담이 될 수 있음',
      '패키지/상세페이지 현지화가 약하면 온라인 판매 전환이 낮아질 수 있음',
    ],
  },
] satisfies Array<{ title: string; tone: 'default' | 'risk'; items: string[] }>;

export function ReportPreview() {
  const [activeSection, setActiveSection] = React.useState<ReportSectionId>('points');
  const activeIndex = reportSections.findIndex((section) => section.id === activeSection);
  const activeReport = reportSections[activeIndex];

  return (
    <div className="relative mt-8 overflow-hidden rounded-[28px] border border-white/70 bg-white/58 p-4 shadow-[0_28px_90px_rgba(21,49,86,0.12)] backdrop-blur-[22px] lg:grid lg:grid-cols-[0.24fr_0.76fr] lg:gap-4 lg:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(230,248,244,0.82),rgba(255,255,255,0)_32%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(247,249,252,0.36))]" />

      <aside className="relative rounded-2xl border border-white/70 bg-white/62 p-4 shadow-[0_16px_42px_rgba(21,49,86,0.07)] backdrop-blur-xl">
        <p className="ft-caption font-semibold uppercase tracking-[0.18em] text-[#12978b]">Report sections</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {reportSections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`relative grid grid-cols-[54px_1fr] items-center overflow-hidden rounded-lg border px-3.5 py-3 text-left transition ${
                  isActive
                    ? 'active-report-section border-[#12978b]/25 bg-[#e6f8f4] text-[#153156] shadow-sm'
                    : 'border-white/70 bg-white/54 text-[#536176] hover:border-[#12978b]/18 hover:bg-white/80'
                }`}
              >
                {isActive && <span className="absolute bottom-2 left-0 top-2 z-[2] w-1 rounded-r-full bg-[#12978b]" />}
                <span className={`relative z-[1] text-center text-base font-medium ${isActive ? 'text-[#12978b]' : 'text-[#8a96a8]'}`}>{section.number}</span>
                <span className="relative z-[1] text-sm font-medium">{section.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_18px_54px_rgba(21,49,86,0.08)] backdrop-blur-xl lg:mt-0 lg:p-5">
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/90" />
        <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="ft-panel-title">샘플 제품 검토 리포트</h3>
            <p className="mt-0.5 text-sm font-medium text-[#536176]">{activeReport.title} 상세 미리보기</p>
          </div>
          <div className="flex gap-2 text-xs font-medium text-[#536176]">
            <span className="rounded-full border border-[#dfe5ee] bg-white/70 px-3 py-1.5">{activeReport.title}</span>
            <span className="rounded-full border border-[#dfe5ee] bg-white/70 px-3 py-1.5">{activeReport.number} / 04</span>
          </div>
        </div>

        {activeSection === 'intro' && <EnglishIntroReport />}
        {activeSection === 'points' && <SalesPointReport />}
        {activeSection === 'buyers' && <BuyerTypeReport />}
        {activeSection === 'checklist' && <ChecklistReport />}

        <p className="ft-small mt-4 flex items-start gap-2 rounded-lg border border-[#dfe5ee]/80 bg-white/64 px-3.5 py-3 text-[#536176]">
          <span className="ft-caption flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#12978b]/25 bg-[#e6f8f4] font-medium text-[#12978b]">i</span>
          <span>위 리포트는 실제 검토 예시입니다. 제품과 시장 상황에 따라 내용은 달라질 수 있습니다.</span>
        </p>
      </div>
    </div>
  );
}

function ChecklistReport() {
  return (
    <>
      <div className="mt-2 rounded-xl border border-[#12978b]/22 bg-[#e6f8f4]/42 px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-[#0e7d73]">
          상담 준비 상태 요약
          <Tooltip text="현재 제품 정보만으로 첫 바이어 상담이 가능한지, 추가 확인이 필요한 항목은 무엇인지 요약합니다." />
        </div>
        <p className="ft-report-text mt-1 text-[#153156]">
          첫 상담은 가능하지만, 가격 조건과 인증 자료는 추가 확인이 필요합니다.
        </p>
      </div>

      <div className="mt-3 grid gap-2.5 lg:grid-cols-3">
        {checklistColumns.map((column) => (
          <div
            key={column.title}
            className={`rounded-xl border bg-white/72 px-3 py-3 ${
              column.tone === 'risk'
                ? 'border-[#e3d4c4]/90 border-l-[#d38a45]/60'
                : 'border-[#dfe5ee]/85 border-l-[#12978b]/45'
            } border-l-4`}
          >
            <p className={`text-sm font-medium ${column.tone === 'risk' ? 'text-[#8a5a2f]' : 'text-[#153156]'}`}>{column.title}</p>
            <ul className="ft-report-text mt-2 space-y-1.5 text-[#536176]">
              {column.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className={`mt-[9px] h-1 w-1 shrink-0 rounded-full ${column.tone === 'risk' ? 'bg-[#d38a45]/70' : 'bg-[#12978b]/55'}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-[#dfe5ee]/80 bg-white/78 px-3.5 py-3 shadow-[0_14px_34px_rgba(21,49,86,0.05)]">
        <p className="text-sm font-medium text-[#12978b]">상담 전 우선 준비할 것</p>
        <p className="ft-report-text mt-1 text-[#153156]">
          우선 가격표, 샘플 발송 조건, 소재 인증 여부를 확인하면 첫 바이어 상담 가능성이 높아집니다.
        </p>
        <p className="ft-caption mt-1.5 border-t border-[#dfe5ee]/75 pt-2 text-[#536176]">
          필요한 자료는 Fairtale과 함께 하나씩 정리해나갈 수 있습니다.
        </p>
      </div>
    </>
  );
}

function BuyerTypeReport() {
  return (
    <>
      <div className="mt-2 rounded-xl border border-[#12978b]/22 bg-[#e6f8f4]/42 px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-[#0e7d73]">
          추천 기준 요약
          <Tooltip text="제품 특성과 현재 준비 수준을 기준으로 우선 접근할 바이어 유형을 좁혀 정리합니다." />
        </div>
        <p className="ft-report-text mt-1 text-[#153156]">
          온라인 판매 적합성, K-lifestyle 스토리 활용 가능성, 소량 테스트 판매 가능성을 기준으로 우선순위를 정리했습니다.
        </p>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#153156]">우선 추천 바이어 유형</p>
          <p className="text-xs font-medium text-[#8a96a8]">실제 바이어명이 아닌 접근 우선순위입니다</p>
        </div>
        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-3 lg:items-stretch">
          {recommendedBuyerTypes.map((buyer) => (
            <div key={buyer.rank} className="flex h-full min-h-[184px] flex-col rounded-xl border border-[#dfe5ee]/85 bg-white/72 p-3 shadow-[0_12px_30px_rgba(21,49,86,0.045)]">
              <div className="flex items-start justify-between gap-3">
                <p className="ft-small font-medium text-[#153156]">{buyer.title}</p>
                <span className="ft-caption shrink-0 rounded-full border border-[#12978b]/25 bg-[#e6f8f4] px-2 py-1 font-medium text-[#0e7d73]">
                  {buyer.rank}
                </span>
              </div>
              <p className="ft-report-text mt-2 text-[#536176]">{buyer.reason}</p>
              <div className="ft-caption mt-auto min-h-[54px] rounded-md bg-[#f7f9fc]/85 px-2.5 py-1.5 text-[#0e7d73]">
                상담 포인트: {buyer.point}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-[#dfe5ee]/80 bg-white/72 px-3.5 py-3">
        <p className="text-sm font-medium text-[#536176]">우선순위 낮은 바이어 유형</p>
        <div className="mt-2 grid gap-2 lg:grid-cols-2">
          {lowerPriorityBuyerTypes.map((buyer) => (
            <div key={buyer.title} className="rounded-lg border border-[#dfe5ee]/75 bg-[#f7f9fc]/65 px-3 py-2.5">
              <p className="ft-report-text font-medium text-[#153156]">{buyer.title}</p>
              <p className="ft-caption mt-1 text-[#536176]">{buyer.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SalesPointReport() {
  return (
    <>
      <div className="mt-2 rounded-xl border border-[#12978b]/22 bg-[#e6f8f4]/42 px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-[#0e7d73]">
          핵심 제안 방향
          <Tooltip text="이 제품을 해외 바이어에게 어떤 시장 포지션으로 제안할지 정리한 내부 전략 요약입니다." />
        </div>
        <p className="ft-body mt-1 font-medium text-[#153156]">
          K-food 문화를 활용한 온라인 친화형 재사용 런치박스 카테고리로 제안
        </p>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-[#dfe5ee]/90 bg-white/66">
        <div className="ft-report-text grid grid-cols-[0.23fr_0.43fr_0.34fr] border-b border-[#dfe5ee]/90 bg-[#f7f9fc]/70 font-medium text-[#153156]">
          <div className="border-r border-[#dfe5ee]/90 px-3 py-2.5">판매 포인트</div>
          <div className="border-r border-[#dfe5ee]/90 px-3 py-2.5">바이어가 관심 가질 이유</div>
          <div className="px-3 py-2.5">상담 전 보완하면 좋은 자료</div>
        </div>
        {salesPointRows.map((row) => (
          <div key={row.point} className="ft-report-text grid grid-cols-[0.23fr_0.43fr_0.34fr] border-b border-[#dfe5ee]/80 last:border-b-0">
            <div className="border-r border-[#dfe5ee]/80 px-3 py-2.5 font-medium text-[#153156]">{row.point}</div>
            <div className="border-r border-[#dfe5ee]/80 px-3 py-2.5 text-[#536176]">{row.reason}</div>
            <div className="bg-[#e6f8f4]/28 px-3 py-2.5 text-[#0e7d73]">{row.prep}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-[#dfe5ee]/80 bg-white/78 px-3.5 py-3 shadow-[0_14px_34px_rgba(21,49,86,0.05)]">
        <div className="flex items-center gap-1.5 text-sm font-medium text-[#12978b]">
          우선 강조 메시지
          <Tooltip text="바이어 상담이나 제품 소개에서 실제로 먼저 꺼낼 수 있는 세일즈 문장입니다." />
        </div>
        <p className="ft-report-text mt-1 text-[#153156]">
          이 제품은 한식 도시락 문화에서 출발했지만, 해외 시장에서는 접이식 보관성과 재사용 가능한 스테인리스 소재를 갖춘 컴팩트 런치박스 세트로 소개하는 것이 적합합니다.
        </p>
      </div>
    </>
  );
}

function EnglishIntroReport() {
  return (
    <>
      <div className="mt-2 overflow-hidden rounded-xl border border-[#dfe5ee]/90 bg-white/66">
        <div className="ft-small grid grid-cols-[0.17fr_0.43fr_0.4fr] border-b border-[#dfe5ee]/90 bg-[#f7f9fc]/70 text-center font-medium">
          <div className="border-r border-[#dfe5ee]/90 px-3 py-3">구분</div>
          <div className="border-r border-[#dfe5ee]/90 px-3 py-3">원본</div>
          <div className="px-3 py-3 text-[#12978b]">바이어용</div>
        </div>
        <div className="ft-small grid grid-cols-[0.17fr_0.43fr_0.4fr] border-b border-[#dfe5ee]/90">
          <div className="border-r border-[#dfe5ee]/90 px-3 py-3 text-center font-medium">제품명</div>
          <div className="border-r border-[#dfe5ee]/90 px-3 py-3 text-center font-medium">접이식 스테인리스 김밥 도시락 세트</div>
          <div className="bg-[#e6f8f4]/38 px-3 py-3 text-center font-medium text-[#0e7d73]">Foldable Stainless Steel Lunchbox Set</div>
        </div>
        <div className="ft-small grid grid-cols-[0.17fr_0.43fr_0.4fr]">
          <div className="border-r border-[#dfe5ee]/90 px-3 py-3 text-center font-medium">카테고리</div>
          <div className="border-r border-[#dfe5ee]/90 px-3 py-3 text-center font-medium">주방 · 생활용품</div>
          <div className="bg-[#e6f8f4]/38 px-3 py-3 text-center font-medium text-[#0e7d73]">Kitchenware · Lifestyle Goods</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <div className="rounded-xl border border-[#dfe5ee]/80 bg-white/78 p-4">
          <p className="text-base font-medium text-[#153156]">Before</p>
          <p className="ft-body mt-3 text-[#153156]">
            집에서 싸 먹는 김밥 감성을 그대로 담은, 접어서 보관하기 편한 스테인리스 도시락 세트입니다.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-[#12978b]">
            <ArrowIcon className="h-7 w-7" />
          </span>
        </div>

        <div className="rounded-xl border border-[#12978b]/35 bg-white/82 p-4 shadow-[0_14px_34px_rgba(18,151,139,0.08)]">
          <p className="text-base font-medium text-[#0e7d73]">Buyer-ready English Introduction</p>
          <p className="ft-body mt-3 text-[#153156]">
            A compact stainless steel lunchbox set inspired by Korean home-style meal culture, designed for easy storage, reusable daily use, and online-friendly gift packaging.
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-[#dfe5ee]/80 pt-4">
        <p className="text-sm font-medium text-[#12978b]">재구성 포인트</p>
        <div className="ft-small mt-3 grid gap-3 text-[#536176] lg:grid-cols-3">
          <CheckItem text="“김밥 감성”을 직역하지 않고 해외 바이어가 이해할 문화 맥락으로 재구성" />
          <CheckItem text="제품 용도를 김밥 전용이 아닌 lunchbox set으로 확장" bordered />
          <CheckItem text="보관 편의성, 재사용성, 선물 패키징 등 검토 요소 추가" />
        </div>
      </div>
    </>
  );
}

function PlaceholderReport({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-2 rounded-xl border border-[#dfe5ee]/80 bg-white/72 p-8 text-center">
      <p className="ft-card-title text-[#153156]">{title}</p>
      <p className="ft-small mt-2 text-[#536176]">{text}</p>
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#12978b]/35 bg-white/60 text-[10px] font-medium leading-none text-[#12978b] outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#12978b]/30"
      >
        i
      </button>
      <span className="ft-caption pointer-events-none absolute left-1/2 top-6 z-20 w-64 -translate-x-1/2 rounded-md border border-[#dfe5ee] bg-[#153156] px-3 py-2 font-normal text-white opacity-0 shadow-lg shadow-black/10 transition group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}

function CheckItem({ text, bordered = false }: { text: string; bordered?: boolean }) {
  return (
    <div className={`flex gap-2 border-[#dfe5ee]/80 ${bordered ? 'lg:border-x lg:px-4' : ''}`}>
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#12978b]/20 bg-[#e6f8f4] text-[#12978b]">
        <CheckIcon />
      </span>
      <span>{text}</span>
    </div>
  );
}

function ArrowIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h13.5" />
      <path d="m13.5 6.8 5 5.2-5 5.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6.4 12.4 3.4 3.4 7.8-8" />
    </svg>
  );
}
