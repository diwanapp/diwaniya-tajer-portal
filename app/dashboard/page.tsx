"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Boxes, Eye, MousePointerClick, Phone, Send } from "lucide-react";
import { getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantAd, MerchantMeResponse, MerchantProduct } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { MetricCard } from "@/components/metric-card";

export default function DashboardPage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [ads, setAds] = useState<MerchantAd[]>([]);
  const [error, setError] = useState("");

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
        setError(err instanceof Error ? err.message : "تعذر تحميل البيانات.");
      }
    }
    load();
  }, []);

  const pendingProducts = products.filter((item) => item.status === "pending_review").length;
  const pendingAds = ads.filter((item) => item.status === "pending_review").length;

  const storeName = me?.stores[0]?.name ?? "متجرك";
  const statusLabel = me?.stores[0]?.status === "pending_review" ? "قيد المراجعة" : me?.stores[0]?.status ?? "—";

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
      <div className="mb-6">
        <p className="text-sm font-bold text-gold-700">مرحبًا بك</p>
        <h1 className="mt-1 text-3xl font-black text-navy-900">{storeName}</h1>
        <p className="mt-2 text-sm text-ink-700/75">
          حالة المتجر: <span className="font-black text-warn">{statusLabel}</span>
        </p>
      </div>

      {error ? <div className="mb-5 rounded-2xl bg-err/10 p-4 text-sm font-bold text-err">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="surface p-5">
          <Boxes className="text-gold-700" />
          <p className="mt-4 text-sm text-ink-700/70">المنتجات</p>
          <p className="num mt-2 text-3xl font-black text-navy-900">{products.length}</p>
          <p className="mt-2 text-sm text-ink-700/65">{pendingProducts} قيد المراجعة</p>
        </div>
        <div className="surface p-5">
          <BadgePercent className="text-gold-700" />
          <p className="mt-4 text-sm text-ink-700/70">طلبات الإعلان</p>
          <p className="num mt-2 text-3xl font-black text-navy-900">{ads.length}</p>
          <p className="mt-2 text-sm text-ink-700/65">{pendingAds} قيد المراجعة</p>
        </div>
        <div className="surface p-5">
          <p className="text-sm font-black text-gold-700">الأثر التجاري</p>
          <p className="mt-4 text-lg font-black text-navy-900">
            قريبًا ستظهر بيانات الضغطات والمشاهدات هنا.
          </p>
          <p className="mt-2 text-sm leading-7 text-ink-700/65">
            الهدف أن يرى التاجر أثر الإعلان والمنتجات على التواصل والمبيعات المحتملة.
          </p>
        </div>
      </div>
    </TajerShell>
  );
}
