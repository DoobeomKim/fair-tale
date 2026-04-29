# Landing Page Update Log (2026-04-28)

## Scope

- Target app: `web/fair-tale/client`
- Main file: `src/app/page.tsx`
- Supporting files:
  - `src/app/layout.tsx`
  - `src/app/globals.css`
  - `public/brand/*`
  - `public/fonts/*`

## Brand Assets And Favicon

- Brand assets organized in `public/brand`.
- Favicon assets added:
  - `public/favicon.png`
  - `public/apple-icon.png`
- Metadata icon paths configured in `src/app/layout.tsx`.
- Removed old conflicting `src/app/favicon.ico`.

## Landing UI Changes

- Replaced placeholder text icons with reusable custom SVG icon system.
- Added shared icon helpers:
  - `IconGlyph`
  - `IconBadge`
- Updated `ReportCard` and `StepLabel` to use the icon system.
- Increased icon fill ratio in circle/square containers to around 70%.
- Updated report card copy style:
  - `판매 포인트`, `추천 바이어 유형` changed to 3-line bullet summaries.

## Hero Section Changes

- Tightened hero spacing and typography density:
  - reduced section paddings and grid gap,
  - reduced title-description spacing,
  - tuned heading/body size scale.
- Hero title split into fixed 3-line structure:
  - `제품만 등록하세요.`
  - `해외 바이어 상담 준비는`
  - `Fairtale이 도와드립니다.`

## Hero Report Thumbnail

- Product thumbnail ratio changed to portrait (`aspect-[3/4]`).
- Replaced placeholder with real sample image:
  - `public/brand/hero-product-sample.png`

## Buyer Section Icon

- Replaced globe icon with uploaded flags image:
  - `public/brand/asia-flags.png`
- Adjusted wrapper/image sizing to remove visible white edge.

## Title Font Pipeline

- Default UI/body font remains `Pretendard`.
- Major landing headings use Noonnu's webfont version of `GyeongbokgungSumunjangTitle`.
- Local `otf/ttf` title font loading was removed because Chrome rejected the downloaded local font files with an OTS parsing error:
  - `Failed to decode downloaded font`
  - `OTS parsing error: kern: Bad subtable`
- Current title font loading is declared in `src/app/globals.css` with CDN `woff2` files:
  - `Sumunjang_TitleL.woff2` at weight `300`
  - `Sumunjang_TitleM.woff2` at weight `500`
  - `Sumunjang_TitleB.woff2` at weight `700`
- `src/app/layout.tsx` loads Google Fonts as fallback/support fonts:
  - `Chiron Sung HK`
  - `EB Garamond`
  - `Noto Sans KR`
- Title fallback order:
  - `GyeongbokgungSumunjangTitle`
  - `Chiron Sung HK`
  - `Pretendard`
  - `Noto Sans KR`
  - `sans-serif`
- `.title-korean` is intentionally limited to large brand/section headings only.
- Report/card/process labels now use the normal body font stack instead of the display title font:
  - `영문 소개`
  - `판매 포인트`
  - `추천 바이어 유형`
  - `상담 준비 체크리스트`
  - `제품 정보 등록`
  - `Fairtale 팀 검토`
  - `바이어용 소개 자료 정리`
  - `상담 가능성 확인`

## Development Notes

- Running `next dev` and `next build` at the same time can corrupt temporary `.next` chunk references in development and cause errors like `Cannot find module './447.js'`.
- If the page appears unstyled during development, restart the Next dev server and hard refresh the browser.
- The console warning below can come from a local service worker trying to cache Chrome extension URLs and is not a landing page rendering bug:
  - `Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported`
- Hydration warnings containing `data-immersive-translate-page-theme` are caused by browser translation extensions mutating the HTML before React hydrates.
