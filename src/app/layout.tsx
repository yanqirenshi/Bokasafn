import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bókasafn", template: "%s | Bókasafn" },
  description: "著作権の切れた古典を集めた図書館",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant">
      {/* ブラウザの拡張機能が body に属性を足すことがある（ColorZilla の cz-shortcut-listen など）。
          body の属性の違いだけ、ハイドレーションの警告を出さない。子の要素には及ばない。 */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
