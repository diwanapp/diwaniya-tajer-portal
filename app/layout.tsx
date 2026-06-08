import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بوابة التجار | ديوانية",
  description: "اعرض منتجاتك وخدماتك للديوانيات القريبة منك",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
