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
  | 'check';

const processSteps = [
  { title: '제품 정보 등록', icon: 'box' },
  { title: 'Fairtale 팀 검토', icon: 'review' },
  { title: '바이어용 소개 자료 정리', icon: 'presentation' },
  { title: '상담 가능성 확인', icon: 'handshake' },
] satisfies Array<{ title: string; icon: IconName }>;

const partnerItems = [
  { label: '수출입 실무 파트너', icon: 'briefcase' },
  { label: '계약/법무 검토', icon: 'scale' },
  { label: '인증/통관/물류', icon: 'shipping' },
  { label: '카탈로그 현지화', icon: 'document' },
  { label: '현지 마케팅', icon: 'megaphone' },
] satisfies Array<{ label: string; icon: IconName }>;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#153156]">
      <header className="sticky top-0 z-30 border-b border-[#dfe5ee]/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Fairtale 홈">
            <img src="/brand/fairtale-logo.svg" alt="Fairtale" className="h-10 w-auto" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#153156] md:flex">
            <a href="#supplier" className="transition hover:text-[#12978b]">수출기업</a>
            <a href="#process" className="transition hover:text-[#12978b]">진행 방식</a>
            <a href="#partners" className="transition hover:text-[#12978b]">파트너</a>
            <a href="#buyer" className="transition hover:text-[#12978b]">바이어용</a>
            <a href="#contact" className="transition hover:text-[#12978b]">문의</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-md px-2.5 py-2 text-sm font-semibold text-[#536176] transition hover:bg-[#f0f4f8] sm:block">
              KO ▾
            </button>
            <button className="hidden rounded-md px-3 py-2 text-sm font-semibold text-[#536176] transition hover:bg-[#f0f4f8] sm:block">
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

      <section id="supplier" className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-8 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-12 lg:pt-20">
          <div className="relative z-10 flex flex-col lg:justify-start">
            <p className="mb-4 inline-flex w-fit rounded-full border border-[#dfe5ee] bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#12978b] shadow-sm lg:text-sm">
              해외진출 첫 관문
            </p>
            <h1 className="title-korean max-w-2xl text-[39px] font-normal leading-[1.18] tracking-[-0.028em] text-[#153156] lg:text-[46px]">
              <span className="block">제품만 등록하세요.</span>
              <span className="block">해외 바이어 상담 준비는</span>
              <span className="block">Fairtale이 도와드립니다.</span>
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#536176] lg:text-lg">
              영문 제품 소개, 해외 판매 포인트,
            </p>
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#536176] lg:text-lg">
              추천 바이어 유형까지 Fairtale이 정리해드립니다.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <a
                href="#contact"
                className="shine-button rounded-md bg-[#153156] px-5 py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_36px_rgba(21,49,86,0.18)] transition hover:bg-[#102746] lg:text-base"
              >
                <span>무료로 제품 검토 요청하기</span>
              </a>
              <a
                href="#outcomes"
                className="shine-button rounded-md border border-[#153156] bg-white px-5 py-3.5 text-center text-sm font-semibold text-[#153156] transition hover:bg-[#f1f5f9] [--shine-color:rgba(21,49,86,0.14)] lg:text-base"
              >
                <span>샘플 결과물 보기</span>
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#536176] lg:text-sm">
              <IconBadge icon="check" size="sm" />
              초기 검토는 무료로 진행됩니다.
            </p>
          </div>

          <div className="relative z-10">
            <div className="absolute -left-8 top-10 h-44 w-44 rounded-full bg-[#12978b]/12 blur-3xl" />
            <div className="absolute -right-10 bottom-8 h-56 w-56 rounded-full bg-[#153156]/10 blur-3xl" />
            <div className="absolute left-8 top-2 h-[88%] w-[88%] rounded-[32px] border border-[#153156]/5 bg-[linear-gradient(135deg,rgba(18,151,139,0.08),rgba(255,255,255,0)_45%,rgba(21,49,86,0.06))]" />
            <div className="absolute right-8 top-12 hidden w-72 space-y-3 opacity-60 lg:block">
              <div className="h-2 rounded-full bg-[#153156]/10" />
              <div className="h-2 w-2/3 rounded-full bg-[#12978b]/15" />
              <div className="h-2 w-5/6 rounded-full bg-[#153156]/10" />
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-white/55 bg-white/[0.52] p-5 shadow-[0_34px_100px_rgba(21,49,86,0.18)] backdrop-blur-[22px]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.88),rgba(255,255,255,0)_34%),linear-gradient(135deg,rgba(255,255,255,0.35),rgba(230,248,244,0.18))]" />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/80" />
              <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBadge icon="clipboard" size="sm" shape="square" />
                  <h2 className="text-xl font-semibold">제품 검토 리포트</h2>
                </div>
                <span className="rounded-full border border-white/60 bg-white/55 px-4 py-2 text-sm font-medium text-[#536176] shadow-sm backdrop-blur-md">
                  AI 기반 분석
                </span>
              </div>

              <div className="grid gap-3 lg:grid-cols-[0.7fr_1fr]">
                <div className="rounded-2xl border border-white/60 bg-white/60 p-3.5 shadow-[0_18px_45px_rgba(21,49,86,0.08)] backdrop-blur-xl">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/50 bg-gradient-to-br from-[#e6f8f4]/70 via-white/45 to-[#f7f9fc]/55">
                    <img
                      src="/brand/hero-product-sample.png"
                      alt="프리미엄 생활용품 샘플 제품"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mt-3 text-base font-semibold lg:text-lg">프리미엄 생활용품 라인</h3>
                  <p className="mt-1 text-xs font-medium text-[#536176] lg:text-sm">홈리빙 · 소비재</p>
                </div>

                <div className="space-y-2.5">
                  <ReportCard
                    icon="document"
                    label="영문 소개"
                    text="A practical lifestyle product line designed for modern homes and export-ready retail channels."
                  />
                  <ReportCard
                    icon="diamond"
                    label="판매 포인트"
                    text={
                      <ul className="space-y-0.5">
                        <li>• 간결한 패키징 설계</li>
                        <li>• 안정적인 공급 운영</li>
                        <li>• 온라인 판매 최적 구성</li>
                      </ul>
                    }
                  />
                  <ReportCard
                    icon="users"
                    label="추천 바이어 유형"
                    text={
                      <ul className="space-y-0.5">
                        <li>• 라이프스타일 편집샵</li>
                        <li>• 온라인 커머스 바이어</li>
                        <li>• 지역 유통 파트너</li>
                      </ul>
                    }
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-4 py-3 text-xs font-medium shadow-sm backdrop-blur-xl lg:text-sm">
                <StepLabel icon="box" label="제품 등록" />
                <IconGlyph icon="arrow" className="h-4 w-4 text-[#8a96a8]" />
                <StepLabel icon="review" label="Fairtale 검토" />
                <IconGlyph icon="arrow" className="h-4 w-4 text-[#8a96a8]" />
                <StepLabel icon="clipboard" label="상담 준비" />
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="buyer" className="px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl border border-[#d7ece9] bg-[#e6f8f4]/70 p-6 shadow-[0_18px_50px_rgba(21,49,86,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#12978b]/20 bg-transparent p-0 shadow-[0_10px_24px_rgba(18,151,139,0.12)]">
              <img
                src="/brand/asia-flags.png"
                alt="아시아 국가 국기 아이콘"
                className="h-[112%] w-[112%] rounded-full object-cover"
              />
            </span>
            <div>
              <h2 className="text-2xl font-semibold">아시아 공급사를 찾고 계신가요?</h2>
              <p className="mt-1 max-w-3xl text-base leading-7 text-[#536176]">
                관심 카테고리를 알려주시면 Fairtale이 적합한 공급사 후보를 큐레이션해드립니다.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="shine-button rounded-md bg-[#12978b] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e7d73]"
          >
            <span>바이어로 시작하기</span>
            <IconGlyph icon="arrow" className="ml-2 inline-block h-4 w-4 align-[-2px]" />
          </a>
        </div>
      </section>

      <section id="outcomes" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12978b]">What you receive</p>
          <h2 className="title-korean mt-3 text-4xl font-normal tracking-[-0.025em]">제품 검토 후 이런 리포트를 받습니다</h2>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-[#536176] lg:text-lg">
            제품 정보를 등록하면, 해외 바이어 상담 가능한 자료로 정리해드립니다.
          </p>
        </div>

        <ReportPreview />
      </section>

      <section id="process" className="border-y border-[#dfe5ee] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12978b]">Process</p>
              <h2 className="title-korean mt-3 text-4xl font-normal tracking-[-0.025em]">어렵지 않게, 단계별로 진행합니다</h2>
              <p className="mt-2.5 text-lg leading-8 text-[#536176]">
                처음부터 복잡한 계정을 만들 필요 없이 제품 정보를 보내주시면 Fairtale 팀이 검토하고 상담 준비 자료를 정리합니다.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {processSteps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-[#dfe5ee] bg-[#f7f9fc] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <IconBadge icon={step.icon} size="md" shape="square" />
                    <span className="text-sm font-semibold text-[#12978b]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-2.5 text-xl font-semibold">{step.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="partners" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[28px] bg-[#153156] p-8 text-white md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7bd4cc]">Partner network</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <div>
              <h2 className="title-korean text-4xl font-normal tracking-[-0.025em]">바이어를 만나는 것에서 끝나지 않습니다</h2>
              <p className="mt-2.5 text-lg leading-8 text-white/75">
                계약 검토, 인증, 물류, 현지 마케팅까지 필요한 파트너를 연결해 해외진출 실행 가능성을 높입니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {partnerItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-[#7bd4cc]">
                    <IconGlyph icon={item.icon} className="h-4 w-4" />
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12978b]">Request review</p>
            <h2 className="title-korean mt-3 text-4xl font-normal tracking-[-0.025em]">무료 제품 검토를 요청하세요</h2>
            <p className="mt-2.5 text-lg leading-8 text-[#536176]">
              제출 후 Fairtale 팀이 내용을 검토하고, 해외 바이어 상담 준비에 필요한 자료를 정리해드립니다.
            </p>
          </div>
          <form className="rounded-2xl border border-[#dfe5ee] bg-[#f7f9fc] p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="회사명" placeholder="예: Fair Company" />
              <Input label="담당자 이름" placeholder="홍길동" />
              <Input label="이메일" placeholder="name@company.com" />
              <Input label="연락처" placeholder="+82 10 0000 0000" />
              <Input label="제품명" placeholder="제품명을 입력하세요" />
              <Input label="희망 시장" placeholder="예: 독일, 유럽" />
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-medium">제품 설명</span>
              <textarea
                className="mt-2 min-h-32 w-full rounded-md border border-[#dfe5ee] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#12978b]"
                placeholder="제품 특징, 타깃 고객, 현재 판매 채널 등을 간단히 적어주세요."
              />
            </label>
            <button type="button" className="shine-button mt-5 w-full rounded-md bg-[#153156] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#102746]">
              <span>무료 제품 검토 요청하기</span>
            </button>
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

function ReportCard({ icon, label, text }: { icon: IconName; label: string; text: React.ReactNode }) {
  return (
    <div className="flex min-h-[138px] gap-2.5 rounded-2xl border border-white/60 bg-white/58 p-3.5 shadow-[0_14px_36px_rgba(21,49,86,0.07)] backdrop-blur-xl">
      <IconBadge icon={icon} size="sm" shape="square" className="mt-0.5 shrink-0" />
      <div>
        <p className="text-base font-semibold">{label}</p>
        <div className="mt-1 text-[15px] leading-7 text-[#536176]">{text}</div>
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
