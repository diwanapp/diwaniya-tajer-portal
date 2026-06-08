"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Megaphone,
  MousePointerClick,
  Phone,
  Send,
  Store,
  TrendingUp,
} from "lucide-react";
import { getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantAd, MerchantMeResponse, MerchantProduct } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
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
          const [productResult, adResult] = await Promise.all([
            tajerApi.listProducts(token, store.id),
            tajerApi.listAds(token, store.id),
          ]);
          setProducts(productResult.products);
          setAds(adResult.ads);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل بيانات التاجر.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const store = me?.stores[0];

  const pendingProducts = products.filter((item) => item.status === "pending_review").length;
  const approvedProducts = products.filter((item) => item.status === "approved" || item.status === "active").length;
  const pendingAds = ads.filter((item) => item.status === "pending_review").length;
  const totalAdSpend = ads.reduce((sum, ad) => sum + Number(ad.amount_paid || 0), 0);

  const completionSteps = [
    {
      label: "تسجيل المتجر",
      done: Boolean(store),
    },
    {
      label: "إضافة منتج واحد على الأقل",
      done: products.length > 0,
    },
    {
      label: "طلب إعلان مدفوع",
      done: ads.length > 0,
    },
  ];

  const progress = Math.round(
    (completionSteps.filter((step) => step.done).length / completionSteps.length) * 100,
  );

  const metrics = useMemo(
    () => [
      { title: "مشاهدات المتجر", value: "—", hint: "تضاف بعد ربط تتبع المشاهدات من التطبيق.", icon: Eye },
      { title: "ضغطات الاتصال", value: "—", hint: "مؤشر مهم لقياس نية الشراء.", icon: Phone },
      { title: "ضغطات واتساب", value: "—", hint: "سنعرضها بعد إضافة tracking من التطبيق.", icon: Send },
      { title: "ضغطات الإعلان", value: "—", hint: "تقيس أثر الإعلانات المدفوعة.", icon: MousePointerClick },
    ],
    [],
  );

  return (
    <TajerShell>
      {loading ? (
        <LoadingState label="جاري تجهيز لوحة التاجر..." />
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
                  تابع منتجاتك وإعلاناتك ومؤشرات التواصل من مكان واحد. كل متجر ومنتج وإعلان يمر بالمراجعة قبل الظهور للمستخدمين.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/products" className="btn-primary px-6 py-3 text-sm">
                    أضف منتج
                  </a>
                  <a href="/ads" className="btn-secondary px-6 py-3 text-sm font-bold">
                    اطلب إعلان
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-gold-500/20 bg-white/7 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gold-400">جاهزية المتجر</p>
                    <p className="num mt-2 text-4xl font-black">{progress}%</p>
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

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                <StatusChip status={pendingAds > 0 ? "pending_review" : ads.length > 0 ? "approved" : "pending_review"} />
              </div>
              <p className="mt-4 text-sm text-ink-700/70">طلبات الإعلان</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">{ads.length}</p>
              <p className="mt-2 text-sm text-ink-700/65">{pendingAds} قيد المراجعة</p>
            </div>

            <div className="surface p-5">
              <Megaphone className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">إجمالي دفعات الإعلان المسجلة</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">
                {totalAdSpend > 0 ? totalAdSpend.toLocaleString("ar-SA") : "—"}
              </p>
              <p className="mt-2 text-sm text-ink-700/65">SAR</p>
            </div>
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="surface p-6">
              <div className="flex items-center gap-3">
                <Store className="text-gold-700" />
                <h2 className="text-xl font-black text-navy-900">ما الذي يحتاجه متجرك الآن؟</h2>
              </div>

              <div className="mt-5 grid gap-3">
                {products.length === 0 ? (
                  <EmptyMiniState
                    title="ابدأ بإضافة أول منتج"
                    text="أضف منتجًا واحدًا على الأقل بسعر وكمية واضحة حتى يبدأ المتجر بالظهور بشكل أقوى بعد الاعتماد."
                  />
                ) : null}

                {ads.length === 0 ? (
                  <EmptyMiniState
                    title="اطلب أول إعلان مدفوع"
                    text="الإعلانات ستساعدك لاحقًا على الظهور بشكل أفضل داخل السوق، وسنربطها بمؤشرات ضغطات ومشاهدات."
                  />
                ) : null}

                {products.length > 0 && ads.length > 0 ? (
                  <EmptyMiniState
                    title="متجرك جاهز كبداية"
                    text="تابع حالة المراجعة، وحدث منتجاتك وأسعارك بشكل دوري للحفاظ على جودة الظهور."
                  />
                ) : null}
              </div>
            </div>

            <div className="surface p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-gold-700" />
                <h2 className="text-xl font-black text-navy-900">قيمة الأثر التجاري</h2>
              </div>
              <p className="mt-4 text-sm leading-8 text-ink-700/70">
                في المرحلة القادمة سنربط التطبيق بتتبع الضغطات على الاتصال، واتساب، والإعلانات. الهدف أن يرى التاجر أثر حضوره في ديوانية بوضوح، مما يجعل قرار تجديد الإعلان أو زيادة المنتجات أسهل.
              </p>
            </div>
          </section>
        </>
      )}
    </TajerShell>
  );
}
