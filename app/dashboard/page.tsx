"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Banknote,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Megaphone,
  Store,
  TrendingUp,
} from "lucide-react";
import { getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantAd, MerchantMeResponse, MerchantProduct } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { AuthGuard } from "@/components/auth-guard";
import { MetricCard } from "@/components/metric-card";
import { StatusChip } from "@/components/status-chip";
import { LoadingState } from "@/components/loading-state";

function EmptyMiniState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-sand-400/35 bg-ivory-50 p-5">
      <p className="font-black text-navy-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-ink-700/65">{text}</p>
    </div>
  );
}

function moderationState(ad: MerchantAd) {
  return ad.review_status || ad.status;
}

function paymentStatus(ad: MerchantAd) {
  return ad.payment_status || "not_requested";
}

function publicationStatus(ad: MerchantAd) {
  return ad.publication_status || "";
}

function needsMerchantAction(ad: MerchantAd) {
  return moderationState(ad) === "changes_requested" || paymentStatus(ad) === "payment_requested";
}

export default function DashboardPage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [ads, setAds] = useState<MerchantAd[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = getStoredToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const nextMe = await tajerApi.me(token);
        setMe(nextMe);

        const store = nextMe.stores[0];
        if (store) {
          const [productsResponse, adsResponse] = await Promise.all([
            tajerApi.listProducts(token, store.id),
            tajerApi.listAds(token, store.id),
          ]);
          setProducts(productsResponse.products);
          setAds(adsResponse.ads);
        }
      } catch {
        setError("تعذر تحميل بيانات التاجر. حاول التحديث مرة أخرى.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const store = me?.stores[0];

  const pendingProducts = products.filter((item) => item.status === "pending_review").length;
  const approvedProducts = products.filter((item) => item.status === "approved" || item.status === "active").length;
  const actionNeededAds = ads.filter(needsMerchantAction).length;
  const liveAds = ads.filter((item) => publicationStatus(item) === "live").length;
  const scheduledAds = ads.filter((item) => publicationStatus(item) === "scheduled").length;
  const paymentRequestedAds = ads.filter((item) => paymentStatus(item) === "payment_requested").length;
  const hasStoreBasics = Boolean(store?.name && store?.category);
  const hasMapLink = Boolean(store?.google_maps_url);
  const hasContact = Boolean(store?.phone || store?.whatsapp);

  const completionSteps = [
    {
      label: "أكمل بيانات المتجر",
      done: hasStoreBasics,
    },
    {
      label: "أضف رابط الخريطة",
      done: hasMapLink,
    },
    {
      label: "أضف وسائل التواصل",
      done: hasContact,
    },
    {
      label: "أضف أول منتج",
      done: products.length > 0,
    },
    {
      label: "أرسل طلب إعلان",
      done: ads.length > 0,
    },
  ];

  const progress = Math.round(
    (completionSteps.filter((step) => step.done).length / completionSteps.length) * 100,
  );

  const metrics = useMemo(
    () => [
      { title: "المنتجات المسجلة", value: String(products.length), hint: `${pendingProducts} قيد المراجعة · ${approvedProducts} معتمد`, icon: Boxes },
      { title: "طلبات الإعلان", value: String(ads.length), hint: "كل طلب محمّل من بيانات المتجر.", icon: Megaphone },
      { title: "يتطلب إجراء", value: String(actionNeededAds), hint: "تعديلات أو إيصالات تحتاج متابعة.", icon: BadgePercent },
      { title: "بانتظار الدفع", value: String(paymentRequestedAds), hint: "طلبات تحتاج إيصالًا أو اعتماد دفع.", icon: Banknote },
      { title: "ظاهرة الآن", value: String(liveAds), hint: `${scheduledAds} مجدولة للظهور`, icon: Eye },
      { title: "مجدولة", value: String(scheduledAds), hint: "إعلانات لها موعد ظهور محدد.", icon: CalendarClock },
    ],
    [actionNeededAds, ads.length, approvedProducts, liveAds, paymentRequestedAds, pendingProducts, products.length, scheduledAds],
  );

  return (
    <AuthGuard>
      <TajerShell>
      {loading ? (
        <LoadingState label="جاري تحميل لوحة التاجر..." />
      ) : (
        <>
          <section className="rounded-[2rem] bg-navy-900 p-6 text-ivory-50 shadow-card lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-black text-gold-500">لوحة التاجر</p>
                  <StatusChip status={store?.status} />
                </div>

                <h1 className="mt-4 text-3xl font-black leading-tight lg:text-5xl">
                  {store?.name || "متجرك في ديوانية"}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-8 text-ivory-100/72 lg:text-base">
                  تابع بيانات متجرك ومنتجاتك وطلبات الإعلان من مكان واحد. تظهر العناصر بعد مراجعتها واعتمادها من الإدارة.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/products" className="btn-primary px-6 py-3 text-sm">
                    إضافة منتج
                  </a>
                  <a href="/ads" className="btn-secondary px-6 py-3 text-sm font-bold">
                    طلب إعلان
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-gold-500/20 bg-white/7 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gold-400">ملخص جاهزية المتجر</p>
                    <p className="num mt-2 text-4xl font-black">{progress}%</p>
                    <p className="mt-2 max-w-xs text-xs leading-6 text-ivory-100/62">
                      قراءة مختصرة لاكتمال بيانات المتجر والمنتجات وطلبات الإعلان.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gold-500/15 p-3 text-gold-400">
                    <ClipboardCheck size={26} />
                  </div>
                </div>

                <div className="mt-5 h-3 rounded-full bg-white/10">
                  <div
                    className="h-3 rounded-full bg-gold-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {completionSteps.map((step) => (
                    <div key={step.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className={step.done ? "text-ivory-50" : "text-ivory-100/55"}>
                        {step.label}
                      </span>
                      <CheckCircle2
                        size={18}
                        className={step.done ? "text-gold-500" : "text-white/20"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="mt-5 rounded-2xl bg-err/10 p-4 text-sm font-bold text-err">
              {error}
            </div>
          ) : null}

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="surface p-5">
              <div className="flex items-center justify-between">
                <Boxes className="text-gold-700" />
                <StatusChip status={pendingProducts > 0 ? "pending_review" : approvedProducts > 0 ? "approved" : "pending_review"} />
              </div>
              <p className="mt-4 text-sm text-ink-700/70">المنتجات</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">{products.length}</p>
              <p className="mt-2 text-sm text-ink-700/65">
                {pendingProducts} قيد المراجعة · {approvedProducts} معتمد
              </p>
            </div>

            <div className="surface p-5">
              <div className="flex items-center justify-between">
                <BadgePercent className="text-gold-700" />
                <StatusChip status={actionNeededAds > 0 ? "changes_requested" : ads.length > 0 ? "approved" : "pending_review"} />
              </div>
              <p className="mt-4 text-sm text-ink-700/70">طلبات الإعلان</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">{ads.length}</p>
              <p className="mt-2 text-sm text-ink-700/65">{actionNeededAds} يتطلب إجراء · {scheduledAds} مجدول</p>
            </div>

            <div className="surface p-5">
              <div className="flex items-center justify-between">
                <Eye className="text-gold-700" />
                <StatusChip status={liveAds > 0 ? "approved" : "pending_review"} />
              </div>
              <p className="mt-4 text-sm text-ink-700/70">إعلانات ظاهرة الآن</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">{liveAds}</p>
              <p className="mt-2 text-sm text-ink-700/65">{paymentRequestedAds} بانتظار الدفع · {scheduledAds} مجدول</p>
            </div>
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="surface p-6">
              <div className="flex items-center gap-3">
                <Store className="text-gold-700" />
                <h2 className="text-xl font-black text-navy-900">إجراءات تحتاج انتباهك</h2>
              </div>

              <div className="mt-5 grid gap-3">
                {products.length === 0 ? (
                  <EmptyMiniState
                    title="ابدأ بإضافة أول منتج"
                    text="أضف منتجًا واحدًا على الأقل بسعر وكمية واضحة ليتم مراجعته من الإدارة."
                  />
                ) : null}

                {ads.length === 0 ? (
                  <EmptyMiniState
                    title="أرسل أول طلب إعلان"
                    text="قدّم طلب إعلان واضح وتابع مراجعته ودفعه وحالة ظهوره من صفحة الإعلانات."
                  />
                ) : null}

                {products.length > 0 && ads.length > 0 ? (
                  <EmptyMiniState
                    title={actionNeededAds > 0 ? "لديك إعلانات تتطلب إجراء" : "متجرك جاهز كبداية"}
                    text={actionNeededAds > 0 ? "راجع صفحة الإعلانات لمعرفة ملاحظات الإدارة أو تحديث الإيصالات المطلوبة." : "تابع حالة المراجعة، وحدث منتجاتك وأسعارك بشكل دوري للحفاظ على جودة الظهور."}
                  />
                ) : null}
              </div>
            </div>

            <div className="surface p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-gold-700" />
                <h2 className="text-xl font-black text-navy-900">جاهزية الظهور التجاري</h2>
              </div>
              <p className="mt-4 text-sm leading-8 text-ink-700/70">
                ركّز على بيانات متجر واضحة، ومنتجات مكتملة، وإعلانات بحالة مفهومة. تعرض المؤشرات فقط عندما تتوفر بيانات فعلية من النظام.
              </p>
            </div>
          </section>
        </>
      )}
      </TajerShell>
    </AuthGuard>
  );
}
