import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بوابة التجار | ديوانية",
  description: "أدر متجرك ومنتجاتك وطلبات الإعلان في ديوانية.",
  icons: {
    icon: "/brand/favicon.png",
    apple: "/brand/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
