import Link from 'next/link';
import { ReportPreview } from '@/components/landing/ReportPreview';

type IconName =
  | 'document'
  | 'diamond'
  | 'users'
  | 'clipboard'
  | 'spark'
  | 'box'
  | 'review'
  | 'presentation'
  | 'handshake'
  | 'briefcase'
  | 'scale'
  | 'shipping'
  | 'megaphone'
  | 'globe'
  | 'arrow'
  | 'check'
  | 'searchDocument'
  | 'expertReview'
  | 'resultGuide';

const processSteps = [
  {
    number: '01',
    title: '제품 정보만 보내주세요',
    timing: '약 5분',
    supplier: '제품 설명, 사진, 현재 판매 정보 공유',
    fairtale: '검토에 필요한 항목 확인',
  },
  {
    number: '02',
    title: '해외 바이어 관점으로 다시 봅니다',
    timing: '1-2 영업일',
    supplier: '가격, MOQ, 샘플 가능 여부 확인',
    fairtale: '판매 포인트, 리스크, 추천 바이어 유형 분석',
  },
  {
    number: '03',
    title: '바이어용 자료로 정리합니다',
    timing: '리포트 정리',
    supplier: '부족한 자료 보완',
    fairtale: '영문 소개, 판매 포인트, 상담 체크리스트 정리',
  },
  {
    number: '04',
    title: '바이어 매칭과 상담을 준비합니다',
    timing: '후보 매칭',
    supplier: '상담 가능 조건 확인',
    fairtale: '적합 바이어 후보 확인, 접근 우선순위와 상담 준비사항 제안',
  },
] satisfies Array<{ number: string; title: string; timing: string; supplier: string; fairtale: string }>;

const partnerItems = [
  { label: '계약/법무 검토', icon: 'scale' },
  { label: '인증/통관 확인', icon: 'clipboard' },
  { label: '샘플 배송/물류', icon: 'shipping' },
  { label: '카탈로그 현지화', icon: 'document' },
  { label: '현지 마케팅/세일즈', icon: 'megaphone' },
] satisfies Array<{ label: string; icon: IconName }>;

const partnerQuestions = [
  '계약 조건은 괜찮을까?',
  '인증이나 통관이 필요할까?',
  '샘플 배송은 어떻게 하지?',
  '현지 판매 준비는 누가 도와줄까?',
] satisfies string[];

const reviewDeliverables = [
  '바이어용 제품 소개 방향',
  '해외 판매 포인트',
  '추천 바이어 유형',
  '상담 전 준비사항',
] satisfies string[];

const reviewSteps = [
  { number: '01', title: '제품 정보 확인', image: '/review-icons/product-info.png' },
  { number: '02', title: 'AI + 전문가 검토', image: '/review-icons/expert-review.png' },
  { number: '03', title: '결과 및 다음 액션 안내', image: '/review-icons/result-guide.png' },
] satisfies Array<{ number: string; title: string; image: string }>;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#153156]">
      <header className="sticky top-0 z-30 border-b border-[#dfe5ee]/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Fairtale 홈">
            <img src="/brand/fairtale-logo.svg" alt="Fairtale" className="h-10 w-auto" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#153156] md:flex">
            <a href="#supplier" className="transition hover:text-[#12978b]">수출기업</a>
            <a href="#process" className="transition hover:text-[#12978b]">진행 방식</a>
            <a href="#partners" className="transition hover:text-[#12978b]">파트너</a>
            <a href="#buyer" className="transition hover:text-[#12978b]">바이어용</a>
            <a href="#contact" className="transition hover:text-[#12978b]">문의</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-md px-2.5 py-2 text-sm font-medium text-[#536176] transition hover:bg-[#f0f4f8] sm:block">
              KO ▾
            </button>
            <button className="hidden rounded-md px-3 py-2 text-sm font-medium text-[#536176] transition hover:bg-[#f0f4f8] sm:block">
              로그인
            </button>
            <a
              href="#contact"
              className="shine-button rounded-md bg-[#153156] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102746]"
            >
              <span>제품 검토 요청</span>
            </a>
          </div>
        </div>
      </header>

      <section id="supplier" className="relative scroll-mt-24 overflow-hidden bg-[#111827] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(123,212,204,0.18),transparent_28%),radial-gradient(circle_at_72%_70%,rgba(118,95,199,0.34),transparent_36%),linear-gradient(135deg,#111827_0%,#153156_48%,#202743_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#f7f9fc]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-0 pt-12 text-center lg:px-8 lg:pt-14">
          <div className="relative z-10 flex max-w-5xl flex-col items-center">
            <p className="mb-5 inline-flex w-fit rounded-full border border-white/14 bg-white/[0.08] px-3.5 py-1.5 text-xs font-medium text-[#9be2dc] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md lg:text-sm">
              해외진출 첫 관문
            </p>
            <h1 className="ft-hero-title max-w-5xl text-white">
              <span className="block">제품만 등록하세요</span>
              <span className="block">해외 상담 준비 Fairtale이 도와드립니다</span>
            </h1>
            <p className="ft-body-large mx-auto mt-4 max-w-3xl text-white/68">
              영문 제품 소개, 해외 판매 포인트, 추천 바이어 유형까지 Fairtale이 정리해드립니다.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <a
                href="#contact"
                className="shine-button rounded-md border border-white/16 bg-white px-5 py-3.5 text-center text-sm font-semibold text-[#153156] shadow-[0_18px_42px_rgba(0,0,0,0.22)] transition hover:bg-[#f7f9fc] lg:text-base"
              >
                <span>제품 검토 요청하기</span>
              </a>
              <a
                href="#outcomes"
                className="shine-button rounded-md border border-white/16 bg-white/[0.08] px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/[0.13] [--shine-color:rgba(255,255,255,0.22)] lg:text-base"
              >
                <span>샘플 결과물 보기</span>
              </a>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-white/62 lg:text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#7bd4cc]/24 bg-[#7bd4cc]/10 text-[#7bd4cc]">
                <IconGlyph icon="check" className="h-3.5 w-3.5" />
              </span>
              초기 검토는 무료로 진행됩니다.
            </p>
          </div>

          <HeroDashboardMock />
        </div>
      </section>

      <section id="buyer" className="scroll-mt-24 px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl border border-[#d7ece9] bg-[#e6f8f4]/80 p-6 shadow-[0_18px_50px_rgba(21,49,86,0.08)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#12978b]/20 bg-transparent p-0 shadow-[0_10px_24px_rgba(18,151,139,0.12)]">
              <img
                src="/brand/asia-flags.png"
                alt="Asian country flag icons"
                className="h-[112%] w-[112%] rounded-full object-cover"
              />
            </span>
            <div>
              <h2 className="ft-panel-title">Looking for Asian suppliers?</h2>
              <p className="ft-body mt-1 max-w-3xl text-[#536176]">
                Tell us what categories you source, and Fairtale will curate relevant supplier candidates for you.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="shine-button rounded-md bg-[#12978b] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e7d73]"
          >
            <span>Start as a buyer</span>
            <IconGlyph icon="arrow" className="ml-2 inline-block h-4 w-4 align-[-2px]" />
          </a>
        </div>
      </section>

      <section id="outcomes" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 lg:px-8">
        <div className="text-center">
          <p className="ft-eyebrow text-[#12978b]">What you receive</p>
          <h2 className="ft-section-title mt-3">제품 검토 후 이런 리포트를 받습니다</h2>
          <p className="ft-body-large mx-auto mt-3 max-w-3xl text-[#536176]">
            제품 정보를 등록하면, 해외 바이어 상담 가능한 자료로 정리해드립니다.
          </p>
        </div>

        <ReportPreview />
      </section>

      <section id="process" className="scroll-mt-24 border-y border-[#dfe5ee] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <p className="ft-eyebrow text-[#12978b]">Process</p>
            <h2 className="ft-section-title mx-auto mt-3 max-w-4xl">
              처음 수출도, 상담 가능한 단계부터 시작합니다
            </h2>
            <p className="ft-body-large mx-auto mt-3 max-w-3xl text-[#536176]">
              처음부터 수출 서류와 계약을 모두 준비할 필요는 없습니다. 먼저 바이어가 검토할 수 있는 제품 자료부터 정리하고, 적합한 바이어 후보를 확인합니다.
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-[28px] border border-[#dfe5ee]/85 bg-[#f7f9fc] p-4 shadow-[0_22px_70px_rgba(21,49,86,0.08)] lg:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(230,248,244,0.62),rgba(255,255,255,0.58)_42%,rgba(247,249,252,0.5))]" />

            <div className="relative hidden lg:block">
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[66px] z-0 h-px bg-[#12978b]/28" />
              <div className="pointer-events-none absolute left-[25%] top-[66px] z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[#f7f9fc]/95 px-2 text-sm font-medium text-[#12978b]">
                &gt;&gt;
              </div>
              <div className="pointer-events-none absolute left-[50%] top-[66px] z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[#f7f9fc]/95 px-2 text-sm font-medium text-[#12978b]">
                &gt;&gt;
              </div>
              <div className="pointer-events-none absolute left-[75%] top-[66px] z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[#f7f9fc]/95 px-2 text-sm font-medium text-[#12978b]">
                &gt;&gt;
              </div>

              <div className="relative z-20 grid grid-cols-4">
                {processSteps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <span className="inline-flex rounded-full border border-[#12978b]/25 bg-[#e6f8f4] px-3 py-1 text-xs font-medium text-[#0e7d73] shadow-sm">
                      {step.timing}
                    </span>
                    <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#12978b]/28 bg-white text-sm font-semibold text-[#12978b] shadow-[0_10px_28px_rgba(18,151,139,0.14)]">
                      {step.number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-5 hidden grid-cols-4 gap-3 lg:grid">
              {processSteps.map((step, index) => (
                <div key={step.number} className="relative flex min-h-[244px] flex-col rounded-2xl border border-white/75 bg-white/78 p-4 shadow-[0_14px_36px_rgba(21,49,86,0.06)]">
                  <h3 className="ft-card-title text-[#153156]">{step.title}</h3>

                  <div className="mt-4 space-y-3 text-sm leading-6">
                    <div className="rounded-xl border border-[#dfe5ee]/80 bg-white/70 p-3">
                      <p className="text-xs font-medium text-[#8a96a8]">공급사가 하는 일</p>
                      <p className="mt-1 text-[#536176]">{step.supplier}</p>
                    </div>
                    <div className="rounded-xl border border-[#12978b]/16 bg-[#e6f8f4]/42 p-3">
                      <p className="text-xs font-medium text-[#0e7d73]">Fairtale이 정리하는 일</p>
                      <p className="mt-1 text-[#153156]">{step.fairtale}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative space-y-4 lg:hidden">
              {processSteps.map((step, index) => (
                <div key={step.number} className="relative grid grid-cols-[48px_1fr] gap-3">
                  <div className="relative flex justify-center">
                    {index < processSteps.length - 1 && (
                      <>
                        <span className="absolute left-1/2 top-12 bottom-[-16px] w-px -translate-x-1/2 bg-[#12978b]/28" />
                        <span className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[#f7f9fc]/95 px-1 text-lg font-semibold leading-none text-[#12978b]">
                          ˅
                        </span>
                      </>
                    )}
                    <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#12978b]/28 bg-white text-sm font-semibold text-[#12978b] shadow-[0_10px_28px_rgba(18,151,139,0.14)]">
                      {step.number}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/75 bg-white/80 p-4 shadow-[0_14px_36px_rgba(21,49,86,0.06)]">
                    <span className="inline-flex rounded-full border border-[#12978b]/25 bg-[#e6f8f4] px-3 py-1 text-xs font-medium text-[#0e7d73]">
                      {step.timing}
                    </span>
                    <h3 className="ft-card-title mt-3 text-[#153156]">{step.title}</h3>
                    <div className="mt-4 space-y-3 text-sm leading-6">
                      <div className="rounded-xl border border-[#dfe5ee]/80 bg-white/70 p-3">
                        <p className="text-xs font-medium text-[#8a96a8]">공급사가 하는 일</p>
                        <p className="mt-1 text-[#536176]">{step.supplier}</p>
                      </div>
                      <div className="rounded-xl border border-[#12978b]/16 bg-[#e6f8f4]/42 p-3">
                        <p className="text-xs font-medium text-[#0e7d73]">Fairtale이 정리하는 일</p>
                        <p className="mt-1 text-[#153156]">{step.fairtale}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-4 flex flex-col gap-3 rounded-2xl border border-[#d7ece9] bg-white/78 px-4 py-4 text-sm leading-6 text-[#536176] shadow-sm md:flex-row md:items-center md:justify-between">
              <p>
                <span className="font-medium text-[#153156]">제품 설명이 완벽하지 않아도 괜찮습니다.</span> 필요한 자료와 바이어 후보 검토는 Fairtale과 함께 하나씩 정리해나갈 수 있습니다.
              </p>
              <a href="#contact" className="shine-button shrink-0 rounded-md bg-[#153156] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#102746]">
                <span>제품 검토 요청</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="partners" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 lg:px-8">
        <div className="overflow-hidden rounded-[28px] bg-[#153156] p-8 text-white shadow-[0_26px_80px_rgba(21,49,86,0.22)] md:p-12">
          <div className="max-w-4xl">
            <p className="ft-eyebrow text-[#7bd4cc]">Partner network</p>
            <h2 className="ft-section-title mt-3">바이어를 만나는 것에서 끝나지 않습니다</h2>
            <p className="ft-body-large mt-2.5 max-w-3xl text-white/72">
              상담 이후 필요한 계약, 인증, 물류, 현지화까지 제품 상황에 맞는 실무 파트너를 연결합니다.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_180px_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-[#7bd4cc]">상담 이후 생기는 질문</p>
              <div className="mt-3 grid gap-2.5">
                {partnerQuestions.map((question, index) => (
                  <div key={question} className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.07] px-4 py-3 text-sm font-medium text-white/88">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#7bd4cc]/30 bg-[#7bd4cc]/10 text-xs font-semibold text-[#7bd4cc]">
                      {index + 1}
                    </span>
                    {question}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center lg:h-full">
              <div className="hidden w-full items-center justify-center lg:flex">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7bd4cc]/34 to-[#7bd4cc]/34" />
                <span className="mx-2 whitespace-nowrap rounded-full border border-[#7bd4cc]/28 bg-[#7bd4cc]/10 px-4 py-2 text-xs font-medium text-[#9be2dc] shadow-[0_10px_26px_rgba(18,151,139,0.12)]">
                  파트너 연결
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-[#7bd4cc]/34 via-[#7bd4cc]/34 to-transparent" />
              </div>
              <div className="flex flex-col items-center lg:hidden">
                <span className="h-5 w-px bg-gradient-to-b from-transparent to-[#7bd4cc]/35" />
                <span className="rounded-full border border-[#7bd4cc]/28 bg-[#7bd4cc]/10 px-4 py-2 text-xs font-medium text-[#9be2dc] shadow-[0_10px_26px_rgba(18,151,139,0.12)]">
                  파트너 연결
                </span>
                <span className="h-5 w-px bg-gradient-to-b from-[#7bd4cc]/35 to-transparent" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[#7bd4cc]">Fairtale 실행 네트워크</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {partnerItems.map((item, index) => (
                <div key={item.label} className={`flex items-center gap-3 rounded-xl border border-white/14 bg-white/[0.08] px-4 py-3 text-sm font-medium text-white/90 ${index === partnerItems.length - 1 ? 'sm:col-span-2' : ''}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#7bd4cc]/24 bg-[#7bd4cc]/10 text-[#7bd4cc]">
                    <IconGlyph icon={item.icon} className="h-4 w-4" />
                  </span>
                  {item.label}
                </div>
              ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#7bd4cc]/18 bg-white/[0.055] px-5 py-5 text-center text-base font-medium text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:flex-row">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#7bd4cc]/28 bg-[#7bd4cc]/10 text-[#7bd4cc]">
              <IconGlyph icon="check" className="h-4 w-4" />
            </span>
            <span>필요한 순간에, 필요한 <span className="text-[#7bd4cc]">실무 파트너</span>를 연결합니다.</span>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="ft-eyebrow text-[#12978b]">Request review</p>
            <h2 className="ft-section-title mt-3">제품 검토를 요청하세요</h2>
            <p className="ft-body-large mt-2.5 max-w-xl text-[#536176]">
              제품 설명, 사진, 판매 중인 링크만 있어도 시작할 수 있습니다. Fairtale이 AI 분석과 전문가 검토를 거쳐 해외 바이어 상담 준비 방향을 정리해드립니다.
            </p>

            <div className="mt-7">
              <p className="text-sm font-medium text-[#153156]">검토 후 받을 수 있는 것</p>
              <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {reviewDeliverables.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-medium text-[#536176]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#12978b]/24 bg-[#e6f8f4] text-[#12978b]">
                      <IconGlyph icon="check" className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-sm font-medium text-[#153156]">제출 후 진행</p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
                {reviewSteps.map((step, index) => (
                  <div key={step.number} className="contents">
                    <div className="review-step-card rounded-xl border border-[#dfe5ee] bg-white px-4 py-5 shadow-sm">
                      <div className="review-step-content">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#dfe5ee]/80 bg-white">
                          <img src={step.image} alt="" className="h-12 w-12 object-contain" />
                        </span>
                        <div className="mt-3">
                          <p className="text-sm font-medium leading-none text-[#12978b]">{step.number}</p>
                          <p className="mt-2 text-base font-semibold leading-6 text-[#153156]">{step.title}</p>
                        </div>
                      </div>
                    </div>
                    {index < reviewSteps.length - 1 && (
                      <div className="hidden items-center justify-center text-[#8a96a8] md:flex">
                        <IconGlyph icon="arrow" className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#536176]">
              초기 검토는 무료이며, 보통 영업일 기준 1-2일 내 안내드립니다.
            </p>
          </div>
          <form className="rounded-2xl border border-[#dfe5ee] bg-[#f7f9fc] p-6 shadow-[0_18px_55px_rgba(21,49,86,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="ft-panel-title text-[#153156]">제품 검토 요청</h3>
                <p className="mt-1 text-sm text-[#536176]">가능한 범위에서 편하게 적어주세요.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="회사명" placeholder="예: Fair Company" />
              <Input label="담당자 이름" placeholder="홍길동" />
              <Input label="이메일" placeholder="name@company.com" />
              <Input label="제품명" placeholder="제품명을 입력하세요" />
              <Input label="제품 URL 또는 자료 링크" placeholder="제품 페이지, 카탈로그 링크" />
              <Input label="희망 시장" placeholder="예: 독일, 유럽" />
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-medium">제품 설명 및 추가 메시지</span>
              <textarea
                className="mt-2 min-h-32 w-full rounded-md border border-[#dfe5ee] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#12978b]"
                placeholder="제품 특징, 현재 판매 상황, 강조하고 싶은 점, 해외진출 관련 궁금한 점을 자유롭게 적어주세요."
              />
            </label>
            <button type="button" className="shine-button mt-5 w-full rounded-md bg-[#153156] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#102746]">
              <span>제품 검토 요청하기</span>
            </button>
            <p className="mt-3 text-center text-xs leading-4 text-[#8a96a8]">
              제출하신 정보는 제품 검토와 상담 안내 목적으로만 사용됩니다.
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#dfe5ee] bg-[#f7f9fc] px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#536176] md:flex-row md:items-center md:justify-between">
          <img src="/brand/fairtale-logo.svg" alt="Fairtale" className="h-8 w-auto" />
          <div className="flex flex-wrap gap-5">
            <a href="mailto:hello@fairtale.example">문의</a>
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
            <Link href="/meeting">통역 회의 데모</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroDashboardMock() {
  return (
    <div className="relative z-10 mt-8 w-[min(86vw,360px)] max-w-6xl translate-y-6 overflow-hidden rounded-[28px] border border-white/14 bg-white/[0.08] text-left shadow-[0_36px_120px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:w-full lg:mt-7 lg:translate-y-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))]" />
      <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff9b54]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f3cc63]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#61d394]" />
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/62 sm:flex">
          <IconGlyph icon="globe" className="h-3.5 w-3.5 text-[#7bd4cc]" />
          Fairtale workspace
        </div>
      </div>

      <div className="relative grid gap-3 p-3 lg:grid-cols-[0.74fr_1.35fr_0.86fr]">
        <div className="rounded-2xl border border-white/10 bg-[#111827]/72 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/42">Product</p>
            <span className="rounded-full border border-[#7bd4cc]/22 bg-[#7bd4cc]/10 px-2 py-1 text-[11px] font-medium text-[#9be2dc]">
              접수 완료
            </span>
          </div>
          <div className="mt-2.5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
            <img
              src="/brand/hero-product-sample.png"
              alt="Sample product submitted for Fairtale review"
              className="aspect-[3/2] w-full object-cover object-center opacity-90 lg:aspect-[4/3]"
            />
          </div>
          <h3 className="mt-2.5 text-sm font-semibold text-white">프리미엄 생활용품 라인</h3>
          <p className="mt-0.5 text-xs text-white/52">Home living · consumer goods</p>
          <div className="mt-2 space-y-1.5 text-xs text-white/58">
            <div className="flex items-center justify-between rounded-lg bg-white/[0.06] px-3 py-2">
              <span>제품 URL</span>
              <span className="text-[#9be2dc]">확인됨</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.10] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9be2dc]">Review report</p>
              <h3 className="mt-1 text-xl font-semibold text-white">바이어 상담 준비 리포트</h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#153156]">준비됨</span>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <HeroMetric icon="document" label="영문 소개" value="작성 완료" />
            <HeroMetric icon="diamond" label="판매 포인트" value="4개 정리" />
            <HeroMetric icon="users" label="추천 바이어" value="3개 유형" />
            <HeroMetric icon="clipboard" label="상담 체크리스트" value="다음 액션" />
          </div>

          <div className="mt-3 rounded-xl border border-[#7bd4cc]/16 bg-[#7bd4cc]/10 px-3 py-2.5">
            <p className="text-sm font-medium text-[#9be2dc]">추천 포지셔닝</p>
            <p className="mt-1 text-xs leading-5 text-white/72">
              간결한 패키징과 안정적 공급이 가능한 온라인 친화형 생활용품으로 제안합니다.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 rounded-xl border border-white/10 bg-[#111827]/44 px-3 py-2.5 text-center text-xs font-medium text-white/74">
            <span>제품 검토</span>
            <span className="text-[#7bd4cc]">&gt;&gt;</span>
            <span>바이어 후보</span>
            <span className="text-[#7bd4cc]">&gt;&gt;</span>
            <span>상담 준비</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827]/72 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/42">Next meeting</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7bd4cc]/20 bg-[#7bd4cc]/10 text-[#7bd4cc]">
                <IconGlyph icon="users" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">라이프스타일 리테일러</p>
                <p className="mt-0.5 text-xs text-white/48">우선 추천 바이어 유형</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <HeroChecklistItem text="영문 제품 소개 준비" />
              <HeroChecklistItem text="MOQ 및 샘플 정책 확인" />
              <HeroChecklistItem text="바이어 예상 질문 정리" />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/42">Meeting status</p>
            <p className="mt-1.5 text-base font-semibold text-white">상담 준비 완료</p>
            <p className="mt-1 text-xs leading-5 text-white/52">접근 우선순위와 준비 항목을 확인했습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#7bd4cc]/18 bg-[#7bd4cc]/10 text-[#7bd4cc]">
          <IconGlyph icon={icon} className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs text-white/46">{label}</p>
          <p className="text-sm font-medium text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function HeroChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/[0.045] px-3 py-1.5 text-white/72">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#7bd4cc]/24 bg-[#7bd4cc]/10 text-[#7bd4cc]">
        <IconGlyph icon="check" className="h-2.5 w-2.5" />
      </span>
      {text}
    </div>
  );
}

function ReportCard({ icon, label, text }: { icon: IconName; label: string; text: React.ReactNode }) {
  return (
    <div className="flex min-h-[138px] gap-2.5 rounded-2xl border border-white/60 bg-white/72 p-3.5 shadow-[0_14px_36px_rgba(21,49,86,0.07)]">
      <IconBadge icon={icon} size="sm" shape="square" className="mt-0.5 shrink-0" />
      <div>
        <p className="text-base font-semibold">{label}</p>
        <div className="ft-small mt-1 text-[#536176]">{text}</div>
      </div>
    </div>
  );
}

function StepLabel({ icon, label }: { icon: IconName; label: string }) {
  return (
    <span className="flex items-center justify-center gap-2 text-center">
      <IconGlyph icon={icon} className="h-4 w-4 text-[#12978b]" />
      {label}
    </span>
  );
}

function IconBadge({
  icon,
  size = 'md',
  shape = 'circle',
  className = '',
}: {
  icon: IconName;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  className?: string;
}) {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
  }[size];

  const iconSizeClass = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  }[size];

  return (
    <span
      className={`flex ${sizeClass} items-center justify-center border border-[#12978b]/20 bg-[#e6f8f4] text-[#12978b] shadow-[0_12px_30px_rgba(18,151,139,0.14)] ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'} ${className}`}
    >
      <IconGlyph icon={icon} className={iconSizeClass} />
    </span>
  );
}

function IconGlyph({ icon, className = 'h-5 w-5' }: { icon: IconName; className?: string }) {
  const commonProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (icon) {
    case 'document':
      return (
        <svg {...commonProps}>
          <path d="M7 3.75h7.2L18 7.55v12.7H7z" />
          <path d="M14 3.75V8h4" />
          <path d="M9.8 12.1h4.4" />
          <path d="M9.8 15.4h5.8" />
        </svg>
      );
    case 'diamond':
      return (
        <svg {...commonProps}>
          <path d="M6.8 4.5h10.4L21 9.2 12 20 3 9.2z" />
          <path d="M8.2 9.2 12 20l3.8-10.8" />
          <path d="M7 4.5 8.2 9.2h7.6L17 4.5" />
        </svg>
      );
    case 'users':
      return (
        <svg {...commonProps}>
          <path d="M9.4 11.2a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z" />
          <path d="M3.8 19.2c.6-3 2.7-4.6 5.6-4.6s5 1.6 5.6 4.6" />
          <path d="M16 11.4a2.5 2.5 0 1 0-.8-4.9" />
          <path d="M16.6 14.6c2 .4 3.3 1.8 3.8 4.1" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg {...commonProps}>
          <path d="M8.6 5.2H7a2 2 0 0 0-2 2v12.1h14V7.2a2 2 0 0 0-2-2h-1.6" />
          <path d="M8.8 3.8h6.4v3.4H8.8z" />
          <path d="m8.4 12.4 1.8 1.8 3.8-4" />
          <path d="M8.4 17h7.2" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...commonProps}>
          <path d="M12 3.8 13.6 9l5.2 1.6-5.2 1.7L12 17.4l-1.6-5.1-5.2-1.7L10.4 9z" />
          <path d="m18.2 16.2.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z" />
        </svg>
      );
    case 'box':
      return (
        <svg {...commonProps}>
          <path d="m12 3.8 7.2 3.8v8.8L12 20.2l-7.2-3.8V7.6z" />
          <path d="m4.8 7.6 7.2 3.8 7.2-3.8" />
          <path d="M12 11.4v8.8" />
        </svg>
      );
    case 'review':
      return (
        <svg {...commonProps}>
          <path d="M5 5.2h14v13.6H5z" />
          <path d="m8.4 12.2 2.1 2.1 4.8-5" />
          <path d="M8.2 8h7.6" />
        </svg>
      );
    case 'presentation':
      return (
        <svg {...commonProps}>
          <path d="M4.5 5.5h15v10.2h-15z" />
          <path d="M8.4 19.2 12 15.7l3.6 3.5" />
          <path d="M12 5.5V3.8" />
          <path d="M8.2 11.2h2.4" />
          <path d="M13.4 9.1h2.4" />
        </svg>
      );
    case 'handshake':
      return (
        <svg {...commonProps}>
          <path d="M7.2 12.8 4.8 10.4l3.4-3.7 2.6 2.1" />
          <path d="m16.8 12.8 2.4-2.4-3.4-3.7-3.1 2.5" />
          <path d="m8.6 12 2.4-2.2 2.6 2.6 1.8-.4 2.2 2.2-4 3.9a2.3 2.3 0 0 1-3.2 0L6.8 14.5z" />
          <path d="m9.4 15.8 1.7-1.7" />
          <path d="m12 17.4 1.7-1.7" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg {...commonProps}>
          <path d="M5 8.2h14v10.3H5z" />
          <path d="M9 8.2V5.7h6v2.5" />
          <path d="M5 12h14" />
          <path d="M10.2 12v1.6h3.6V12" />
        </svg>
      );
    case 'scale':
      return (
        <svg {...commonProps}>
          <path d="M12 4.2v15.6" />
          <path d="M7 7h10" />
          <path d="M6.4 7 3.8 12.2h5.2z" />
          <path d="M17.6 7 15 12.2h5.2z" />
          <path d="M8.4 19.8h7.2" />
        </svg>
      );
    case 'shipping':
      return (
        <svg {...commonProps}>
          <path d="M3.8 7.2h10.4v9.2H3.8z" />
          <path d="M14.2 10h3.3l2.7 3.2v3.2h-6" />
          <path d="M7.2 19.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
          <path d="M17.3 19.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
        </svg>
      );
    case 'megaphone':
      return (
        <svg {...commonProps}>
          <path d="M4.4 13.5h3.2l8.2 3.7V6.8l-8.2 3.7H4.4z" />
          <path d="m8.2 13.8 1.4 5h2.6l-1.1-3.8" />
          <path d="M18.2 9.2c.8.7 1.2 1.7 1.2 2.8s-.4 2.1-1.2 2.8" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...commonProps}>
          <path d="M12 20.2a8.2 8.2 0 1 0 0-16.4 8.2 8.2 0 0 0 0 16.4Z" />
          <path d="M4.2 12h15.6" />
          <path d="M12 3.8c2.1 2.2 3.2 4.9 3.2 8.2s-1.1 6-3.2 8.2" />
          <path d="M12 3.8C9.9 6 8.8 8.7 8.8 12s1.1 6 3.2 8.2" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...commonProps}>
          <path d="M5 12h13.5" />
          <path d="m13.5 6.8 5 5.2-5 5.2" />
        </svg>
      );
    case 'searchDocument':
      return (
        <svg {...commonProps}>
          <path d="M6.6 4.2h6.2l3.4 3.4v5.1" />
          <path d="M12.8 4.2v3.6h3.4" />
          <path d="M6.6 4.2v15.6h5.2" />
          <path d="M9 11h4.2" />
          <path d="M9 14.1h2.4" />
          <path d="M16.2 18.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
          <path d="m18.5 20.4-2-2" />
        </svg>
      );
    case 'expertReview':
      return (
        <svg {...commonProps}>
          <path d="M9 11a2.8 2.8 0 1 0 0-5.6A2.8 2.8 0 0 0 9 11Z" />
          <path d="M4.2 18.7c.5-2.8 2.3-4.2 4.8-4.2 1.8 0 3.2.7 4 2.1" />
          <path d="M16.3 10.5a2.3 2.3 0 1 0-.8-4.5" />
          <path d="M16.8 14.1c1.6.4 2.6 1.5 3 3.3" />
          <path d="m14.2 18.1 1.7 1.7 3.6-3.8" />
        </svg>
      );
    case 'resultGuide':
      return (
        <svg {...commonProps}>
          <path d="m12 4.4 6.5 3.4v8.1L12 19.6l-6.5-3.7V7.8z" />
          <path d="m5.5 7.8 6.5 3.6 6.5-3.6" />
          <path d="M12 11.4v8.2" />
          <path d="m9.2 14.8 1.7 1.7 3.9-4" />
          <path d="M17.2 18.6h2.7" />
          <path d="m18.5 17.3 1.4 1.3-1.4 1.3" />
        </svg>
      );
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="m6.4 12.4 3.4 3.4 7.8-8" />
        </svg>
      );
    default:
      return null;
  }
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-[#dfe5ee] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#12978b]"
        placeholder={placeholder}
      />
    </label>
  );
}
