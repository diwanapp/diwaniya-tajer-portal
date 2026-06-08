from pathlib import Path

p = Path("app/page.tsx")

p.write_text(r'''import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Megaphone,
  MousePointerClick,
  PackageCheck,
  ShieldCheck,
  Store,
  TrendingUp,
} from "lucide-react";

const benefits = [
  {
    title: "إدارة متجر واضحة",
    text: "حدّث بيانات متجرك، منتجاتك، أسعارك، ومخزونك من لوحة واحدة.",
    icon: Store,
  },
  {
    title: "منتجات قيد المراجعة",
    text: "أضف المنتجات والعروض، ونراجعها قبل الظهور لحماية جودة السوق.",
    icon: PackageCheck,
  },
  {
    title: "إعلانات قابلة للقياس",
    text: "اطلب إعلانًا مدفوعًا وتابع أثره من خلال مؤشرات الضغطات لاحقًا.",
    icon: Megaphone,
  },
  {
    title: "سوق موثوق",
    text: "كل متجر ومنتج وإعلان يمر بمراجعة قبل الوصول لمستخدمي ديوانية.",
    icon: ShieldCheck,
  },
];

const metrics = [
  { label: "ضغطات واتساب", value: "—", icon: MousePointerClick },
  { label: "ضغطات اتصال", value: "—", icon: TrendingUp },
  { label: "ضغطات إعلان", value: "—", icon: BarChart3 },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-navy-950 text-ivory-50">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(201,168,106,0.20),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(247,241,230,0.08),transparent_28%),linear-gradient(135deg,#152836_0%,#1F3A4D_48%,#152836_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ivory-50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <nav className="flex items-center justify-between">
            <div>
              <p className="text-base font-black text-gold-500">ديوانية</p>
              <p className="text-xs tracking-wide text-ivory-100/55">tajer.diwaniya.online</p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary px-5 py-2 text-sm font-bold">
                دخول
              </Link>
              <Link href="/register" className="btn-primary px-5 py-2 text-sm">
                انضم كتاجر
              </Link>
            </div>
          </nav>

          <div className="grid min-h-[650px] items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-white/7 px-4 py-2 text-sm font-black text-gold-400 backdrop-blur">
                <BadgeCheck size={17} />
                بوابة التجار
              </div>

              <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight lg:text-7xl">
                اعرض منتجاتك وخدماتك للديوانيات القريبة منك
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-9 text-ivory-100/78">
                منصة عملية للتجار لإدارة المتجر، المنتجات، الأسعار، المخزون، وطلبات الإعلانات داخل سوق ديوانية.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn-primary inline-flex items-center gap-2 px-7 py-3">
                  ابدأ الآن
                  <ArrowLeft size={18} />
                </Link>
                <Link href="/login" className="btn-secondary px-7 py-3 font-bold">
                  لدي حساب تاجر
                </Link>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["مراجعة قبل النشر", "جودة أعلى"],
                  ["إعلانات مدفوعة", "أثر أوضح"],
                  ["متجر محلي", "حسب الحي"],
                ].map(([title, hint]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
                    <p className="text-sm font-black text-ivory-50">{title}</p>
                    <p className="mt-1 text-xs text-ivory-100/55">{hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute -inset-8 rounded-[3rem] bg-gold-500/10 blur-3xl" />

              <div className="relative rounded-[2.25rem] border border-gold-500/25 bg-white/8 p-4 shadow-glow backdrop-blur">
                <div className="rounded-[1.75rem] bg-ivory-50 p-5 text-ink-900 shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-black text-gold-700">لوحة التاجر</p>
                      <h2 className="mt-1 text-2xl font-black text-navy-900">
                        لمحة الأداء
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-navy-900 p-3 text-gold-500">
                      <BarChart3 size={22} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {metrics.map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <div
                          key={metric.label}
                          className="flex items-center justify-between rounded-2xl border border-sand-400/25 bg-white p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gold-500/12 p-2 text-gold-700">
                              <Icon size={18} />
                            </div>
                            <p className="text-sm font-bold text-ink-700/75">{metric.label}</p>
                          </div>
                          <p className="num text-2xl font-black text-navy-900">{metric.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-2xl bg-navy-900 p-4 text-ivory-50">
                    <p className="text-sm font-black text-gold-400">قريبًا</p>
                    <p className="mt-2 text-sm leading-7 text-ivory-100/78">
                      مؤشرات الضغطات والمشاهدات ستوضح للتاجر أثر المنتجات والإعلانات على التواصل والطلبات المحتملة.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-4 max-w-md rounded-2xl border border-white/10 bg-white/6 px-5 py-3 text-center text-sm text-ivory-100/65 backdrop-blur">
                المتاجر والمنتجات والإعلانات لا تظهر للمستخدمين إلا بعد المراجعة والاعتماد.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 px-5 py-16 text-ink-900 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black text-gold-700">مصمم للتاجر الجاد</p>
            <h2 className="mt-3 text-4xl font-black text-navy-900">
              كل ما تحتاجه لإدارة حضورك في سوق ديوانية
            </h2>
            <p className="mt-4 text-sm leading-8 text-ink-700/70">
              نسخة أولى خفيفة، عملية، وقابلة للتوسع نحو الدفع الإلكتروني، رفع الصور، والتحليلات المتقدمة.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="surface p-6 transition hover:-translate-y-1 hover:shadow-glow">
                  <div className="inline-flex rounded-2xl bg-gold-500/12 p-3 text-gold-700">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-navy-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink-700/70">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[2rem] bg-navy-900 p-6 text-ivory-50 lg:flex lg:items-center lg:justify-between lg:p-8">
            <div>
              <p className="text-sm font-black text-gold-500">ابدأ بشكل منظم</p>
              <h3 className="mt-2 text-2xl font-black">سجل متجرك وأرسل بياناته للمراجعة</h3>
              <p className="mt-2 text-sm leading-7 text-ivory-100/70">
                نراجع المتجر والمنتجات والإعلانات قبل النشر للحفاظ على سوق موثوق ومفيد.
              </p>
            </div>
            <Link href="/register" className="btn-primary mt-5 inline-flex px-7 py-3 lg:mt-0">
              انضم كتاجر
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
''', encoding="utf-8")

print("Polished Tajer homepage premium layout.")