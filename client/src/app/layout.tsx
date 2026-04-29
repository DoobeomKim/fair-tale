import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fairtale - 해외 바이어 상담 준비 플랫폼",
  description: "제품을 등록하면 Fairtale이 해외 바이어에게 보여줄 소개 자료와 추천 바이어 유형을 정리해드립니다.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chiron+Sung+HK:ital,wght@0,200..900;1,200..900&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Noto+Sans+KR:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
