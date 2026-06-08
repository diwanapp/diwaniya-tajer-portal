"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BellRing,
  Eye,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  PackageCheck,
  Phone,
  RefreshCw,
  Store,
  TrendingUp,
} from "lucide-react";
import { getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantAd, MerchantMeResponse, MerchantProduct } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { LoadingState } from "@/components/loading-state";
import { StatusChip } from "@/components/status-chip";

function InsightMetric({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: React.ElementType;
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-gold-500/12 p-3 text-gold-700">
          <Icon size={22} />
        </div>
        <span className="rounded-full bg-ivory-50 px-3 py-1 text-xs font-black text-ink-700/60">
          قريبًا
        </span>
      </div>
      <p className="mt-5 text-sm text-ink-700/70">{title}</p>
      <p className="num mt-2 text-4xl font-black text-navy-900">{value}</p>
      <p className="mt-3 text-sm leading-7 text-ink-700/60">{hint}</p>
    </div>
  );
}

function ReadinessItem({
  title,
  text,
  done,
}: {
  title: string;
  text: string;
  done: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-ivory-50 p-4">
      <div
        className={
          done
            ? "mt-1 rounded-full bg-ok/10 p-2 text-ok"
            : "mt-1 rounded-full bg-warn/10 p-2 text-warn"
        }
      >
        {done ? <PackageCheck size={18} /> : <BellRing size={18} />}
      </div>
      <div>
        <p className="font-black text-navy-900">{title}</p>
        <p className="mt-1 text-sm leading-7 text-ink-700/65">{text}</p>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [ads, setAds] = useState<MerchantAd[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function reload() {
    const token = getStoredToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

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
  }

  useEffect(() => {
    reload()
      .catch(() => setMessage("تعذر تحميل المؤشرات. تأكد من تشغيل الباكند."))
      .finally(() => setLoading(false));
  }, []);

  const store = me?.stores[0];

  const approvedProducts = products.filter(
    (product) => product.status === "approved" || product.status === "active",
  ).length;

  const pendingProducts = products.filter((product) => product.status === "pending_review").length;
  const pendingAds = ads.filter((ad) => ad.status === "pending_review").length;
  const approvedAds = ads.filter((ad) => ad.status === "approved" || ad.status === "active").length;

  const readiness = useMemo(
    () => [
      {
        title: "بيانات المتجر",
        text: store ? "بيانات المتجر موجودة ويمكن تحديثها من صفحة المتجر." : "أكمل بيانات المتجر أولًا.",
        done: Boolean(store),
      },
      {
        title: "المنتجات",
        text:
          products.length > 0
            ? `${products.length} منتج مسجل، منها ${approvedProducts} معتمد.`
            : "أضف منتجًا واحدًا على الأقل حتى تظهر بيانات أفضل لاحقًا.",
        done: products.length > 0,
      },
      {
        title: "الإعلانات",
        text:
          ads.length > 0
            ? `${ads.length} طلب إعلان، منها ${approvedAds} معتمد.`
            : "يمكنك إرسال طلب إعلان عند الحاجة.",
        done: ads.length > 0,
      },
    ],
    [store, products.length, approvedProducts, ads.length, approvedAds],
  );

  const readinessScore = Math.round(
    (readiness.filter((item) => item.done).length / readiness.length) * 100,
  );

  return (
    <TajerShell>
      {loading ? (
        <LoadingState label="جاري تحميل الأثر التجاري..." />
      ) : (
        <>
          <section className="rounded-[2rem] bg-navy-900 p-6 text-ivory-50 shadow-card lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-black text-gold-500">الأثر التجاري</p>
                  <StatusChip status={store?.status} />
                </div>

                <h1 className="mt-3 text-3xl font-black leading-tight lg:text-5xl">
                  تابع حضور متجرك
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-8 text-ivory-100/72">
                  هنا تظهر لاحقًا مؤشرات المشاهدات والضغطات. حاليًا نعرض جاهزية المتجر والمنتجات والإعلانات.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-gold-500/20 bg-white/7 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gold-400">جاهزية البيانات</p>
                    <p className="num mt-2 text-4xl font-black">{readinessScore}%</p>
                  </div>
                  <div className="rounded-2xl bg-gold-500/15 p-3 text-gold-400">
                    <BarChart3 size={26} />
                  </div>
                </div>

                <div className="mt-5 h-3 rounded-full bg-white/10">
                  <div
                    className="h-3 rounded-full bg-gold-500 transition-all"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {message ? (
            <div className="mt-5 rounded-2xl bg-err/10 p-4 text-sm font-bold text-err">
              {message}
            </div>
          ) : null}

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InsightMetric
              title="مشاهدات المتجر"
              value="—"
              hint="عدد مرات ظهور صفحة المتجر داخل التطبيق."
              icon={Eye}
            />
            <InsightMetric
              title="ضغطات الاتصال"
              value="—"
              hint="عدد الضغطات على زر الاتصال من المستخدمين."
              icon={Phone}
            />
            <InsightMetric
              title="ضغطات واتساب"
              value="—"
              hint="عدد الضغطات على واتساب من صفحة المتجر أو المنتج."
              icon={MessageCircle}
            />
            <InsightMetric
              title="ضغطات الإعلان"
              value="—"
              hint="عدد الضغطات على الإعلانات بعد تفعيل التتبع."
              icon={MousePointerClick}
            />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-navy-900">ملخص المتجر</h2>
                  <p className="mt-1 text-sm text-ink-700/60">قراءة مختصرة للوضع الحالي.</p>
                </div>
                <button
                  type="button"
                  onClick={() => reload().catch(() => setMessage("تعذر تحديث المؤشرات."))}
                  className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-4 py-2 text-sm font-bold text-navy-900"
                >
                  <RefreshCw size={16} />
                  تحديث
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-ivory-50 p-4">
                  <div className="flex items-center gap-3">
                    <Store className="text-gold-700" size={20} />
                    <p className="font-black text-navy-900">{store?.name || "متجرك"}</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink-700/65">
                    {[store?.category, store?.city_name_ar, store?.district_name_ar]
                      .filter(Boolean)
                      .join(" · ") || "أكمل التصنيف والموقع من صفحة المتجر."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-ivory-50 p-4">
                    <p className="text-sm text-ink-700/60">المنتجات</p>
                    <p className="num mt-2 text-3xl font-black text-navy-900">{products.length}</p>
                    <p className="mt-1 text-xs text-ink-700/55">{pendingProducts} قيد المراجعة</p>
                  </div>

                  <div className="rounded-2xl bg-ivory-50 p-4">
                    <p className="text-sm text-ink-700/60">الإعلانات</p>
                    <p className="num mt-2 text-3xl font-black text-navy-900">{ads.length}</p>
                    <p className="mt-1 text-xs text-ink-700/55">{pendingAds} قيد المراجعة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-gold-700" />
                <h2 className="text-xl font-black text-navy-900">ما القادم؟</h2>
              </div>

              <div className="mt-5 grid gap-3">
                {readiness.map((item) => (
                  <ReadinessItem
                    key={item.title}
                    title={item.title}
                    text={item.text}
                    done={item.done}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-gold-500/25 bg-gold-500/10 p-5">
                <div className="flex items-center gap-3">
                  <Megaphone className="text-gold-700" />
                  <h3 className="font-black text-navy-900">ملاحظة</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-ink-700/70">
                  مؤشرات المشاهدات والضغطات تحتاج ربطًا من التطبيق عند ضغط المستخدم على المتجر أو الاتصال أو واتساب أو الإعلان.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </TajerShell>
  );
}
