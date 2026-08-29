import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhytoWorks Shop",
  description:
    "PhytoWorks의 연구·육종 장비와 분석 서비스 맥락을 반영한 학습용 B2B 쇼핑몰",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
