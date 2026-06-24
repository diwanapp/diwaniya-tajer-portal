import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Megaphone,
  PackageCheck,
  ShieldCheck,
  Store,
} from "lucide-react";

const benefits = [
  {
    title: "إدارة متجر واضحة",
    text: "حدّث بيانات متجرك، منتجاتك، أسعارك، ومخزونك من لوحة واحدة.",
    icon: Store,
  },
  {
    title: "منتجات منظمة",
    text: "أضف المنتجات والعروض، ونراجعها قبل الظهور لحماية جودة السوق.",
    icon: PackageCheck,
  },
  {
    title: "إعلانات تحت المتابعة",
    text: "أرسل طلب الإعلان وتابع المراجعة، الدفع، وتجهيز الظهور من بوابة واحدة.",
    icon: Megaphone,
  },
  {
    title: "سوق موثوق",
    text: "كل متجر ومنتج وإعلان يمر بمراجعة قبل الوصول لمستخدمي ديوانية.",
    icon: ShieldCheck,
  },
];

const operations = [
  { label: "تسجيل الدخول", value: "ابدأ", icon: BadgeCheck },
  { label: "إعداد المتجر", value: "مراجعة", icon: Store },
  { label: "طلبات الإعلان", value: "حالة واضحة", icon: Megaphone },
];

const workflow = [
  "تسجيل الدخول",
  "إعداد المتجر",
  "إضافة المنتجات",
  "إرسال طلب الإعلان",
  "مراجعة الإدارة",
  "الظهور داخل التطبيق بعد الاعتماد",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-ivory-50 text-ink-900">
      <section className="relative bg-navy-900 text-ivory-50">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
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
                إنشاء حساب تاجر
              </Link>
            </div>
          </nav>

          <div className="grid min-h-[600px] items-center gap-12 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-14">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-white/7 px-4 py-2 text-sm font-black text-gold-400 backdrop-blur">
                <BadgeCheck size={17} />
                بوابة التجار
              </div>

              <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.18] tracking-tight text-ivory-50 lg:text-6xl">
                بوابة التاجر في ديوانية
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-ivory-100/76 lg:text-lg">
                أدر متجرك، منتجاتك، وطلبات إعلانك في مكان واحد، وتابع اعتمادها وظهورها داخل التطبيق بعد مراجعة الإدارة.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-7 py-3">
                  دخول بوابة التاجر
                  <ArrowLeft size={18} />
                </Link>
                <Link href="#workflow" className="btn-secondary px-7 py-3 font-bold">
                  تعرّف على آلية العمل
                </Link>
              </div>

              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                {[
                  ["مراجعة قبل الظهور", "جودة أعلى"],
                  ["طلبات إعلان", "حالة واضحة"],
                  ["متجر محلي", "حسب الحي"],
                ].map(([title, hint]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
                    <p className="text-sm font-black text-ivory-50">{title}</p>
                    <p className="mt-1 text-xs text-ivory-100/55">{hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative rounded-[2.25rem] border border-gold-500/25 bg-white/8 p-4 shadow-glow backdrop-blur">
                <div className="rounded-[1.75rem] bg-ivory-50 p-5 text-ink-900 shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-black text-gold-700">لوحة التاجر</p>
                      <h2 className="mt-1 text-xl font-black text-navy-900">
                        مسار البوابة
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-navy-900 p-3 text-gold-500">
                      <BarChart3 size={22} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {operations.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl border border-sand-400/25 bg-white p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gold-500/12 p-2 text-gold-700">
                              <Icon size={18} />
                            </div>
                            <p className="text-sm font-bold text-ink-700/75">{item.label}</p>
                          </div>
                          <p className="text-sm font-black text-navy-900">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-2xl bg-navy-900 p-4 text-ivory-50">
                    <p className="text-sm font-black text-gold-400">مسار واضح</p>
                    <p className="mt-2 text-sm leading-7 text-ivory-100/78">
                      كل طلب يمر بمراجعة الإدارة قبل الظهور، وتظهر حالته للتاجر بخطوة تالية واضحة.
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

      <section id="workflow" className="bg-ivory-50 px-5 py-16 text-ink-900 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black text-gold-700">آلية العمل</p>
            <h2 className="mt-3 text-4xl font-black text-navy-900">
              من إعداد المتجر إلى الظهور بعد الاعتماد
            </h2>
            <p className="mt-4 text-sm leading-8 text-ink-700/70">
              البوابة تساعد التاجر على إرسال البيانات ومتابعة حالتها بوضوح دون أرقام تقديرية أو وعود قبل الاعتماد.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {workflow.map((step, index) => (
              <div key={step} className="surface p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-500/12 text-sm font-black text-gold-700">
                  {index + 1}
                </div>
                <p className="mt-3 text-sm font-black leading-6 text-navy-900">{step}</p>
              </div>
            ))}
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
              تسجيل تاجر جديد
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
