import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GlobalNav } from "@/components/GlobalNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "헬스픽 — 더 건강한 음식 고르기",
  description:
    "쿠팡 실시간 상품의 주요 영양 성분을 비교해 더 건강한 음식을 골라보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalNav />
        {children}
      </body>
    </html>
  );
}
