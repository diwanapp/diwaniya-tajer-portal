"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BadgePercent, Boxes, Home, LayoutDashboard, LogOut, Store } from "lucide-react";
import { clearStoredToken } from "@/lib/api";

const BRAND_LOGO = "/brand/logo-mark.png";

const nav = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/store", label: "المتجر", icon: Store },
  { href: "/products", label: "المنتجات", icon: Boxes },
  { href: "/ads", label: "الإعلانات", icon: BadgePercent },
  { href: "/insights", label: "المؤشرات", icon: BarChart3 },
];

export function TajerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearStoredToken();
    router.push("/login");
  }

  const activeItem = nav.find((item) => item.href === pathname);

  return (
    <main className="min-h-screen bg-ivory-50">
      <aside className="fixed right-0 top-0 hidden h-full w-72 bg-navy-900 p-5 text-ivory-50 lg:block">
        <div className="rounded-2xl border border-gold-500/25 bg-white/5 p-5">
          <img
            src={BRAND_LOGO}
            alt="ديوانية"
            className="mb-4 h-14 w-14 object-contain drop-shadow-sm"
          />
          <p className="text-xs font-bold text-gold-500">ديوانية</p>
          <h1 className="mt-2 text-2xl font-black">بوابة التاجر</h1>
          <p className="mt-2 text-sm leading-6 text-ivory-100/75">
            إدارة المتجر والمنتجات وطلبات الإعلان
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-gold-500/20 text-white shadow-inner"
                    : "text-ivory-100/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="absolute bottom-5 right-5 left-5 flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-sm font-bold text-ivory-100/80 hover:bg-white/8"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </aside>

      <section className="lg:pr-72">
        <header className="sticky top-0 z-20 border-b border-sand-400/20 bg-ivory-50/92 px-5 py-4 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gold-700">tajer.diwaniya.online</p>
              <h2 className="text-xl font-black text-navy-900">{activeItem?.label || "لوحة التاجر"}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="hidden rounded-full border border-sand-400/40 px-4 py-2 text-sm font-bold text-navy-900 sm:inline-flex">
                عن البوابة
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-3 py-2 text-sm font-bold text-navy-900 lg:hidden"
              >
                <LogOut size={16} />
                خروج
              </button>
            </div>
          </div>
          <nav className="mx-auto mt-4 flex max-w-6xl gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="تنقل بوابة التاجر">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${
                    active
                      ? "border-gold-500/40 bg-gold-500/15 text-navy-900"
                      : "border-sand-400/30 bg-white/70 text-ink-700/70"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-sand-400/30 bg-white/70 px-3 py-2 text-xs font-black text-ink-700/70"
            >
              <Home size={15} />
              عن البوابة
            </Link>
          </nav>
        </header>

        <div className="mx-auto max-w-6xl p-5 lg:p-8">{children}</div>
      </section>
    </main>
  );
}
