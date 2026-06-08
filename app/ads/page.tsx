"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  CalendarDays,
  ClipboardList,
  DollarSign,
  ImageIcon,
  Megaphone,
  Plus,
  Receipt,
  RefreshCw,
  Target,
} from "lucide-react";
import { marketplaceCategories, getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantAd, MerchantMeResponse } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { StatusChip } from "@/components/status-chip";
import { LoadingState } from "@/components/loading-state";

function formatMoney(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return value.toLocaleString("ar-SA", {
    maximumFractionDigits: 2,
  });
}

function AdCard({ ad }: { ad: MerchantAd }) {
  return (
    <div className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-500">
          {ad.image_url ? <ImageIcon size={24} /> : <Megaphone size={24} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-navy-900">{ad.title}</h3>
              <p className="mt-1 text-sm text-ink-700/65">
                {ad.target_category || "كل التصنيفات"}
              </p>
            </div>
            <StatusChip status={ad.status} />
          </div>

          {ad.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-ink-700/65">
              {ad.description}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-ink-700/45">
              لا يوجد وصف مختصر للإعلان.
            </p>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-ivory-50 p-3">
              <p className="text-xs font-bold text-ink-700/55">المبلغ</p>
              <p className="num mt-1 text-lg font-black text-navy-900">
                {ad.amount_paid || "—"} {ad.currency}
              </p>
            </div>

            <div className="rounded-2xl bg-ivory-50 p-3">
              <p className="text-xs font-bold text-ink-700/55">بداية الإعلان</p>
              <p className="num mt-1 text-sm font-black text-navy-900">
                {ad.requested_start_date || "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-ivory-50 p-3">
              <p className="text-xs font-bold text-ink-700/55">نهاية الإعلان</p>
              <p className="num mt-1 text-sm font-black text-navy-900">
                {ad.requested_end_date || "—"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            {ad.image_url ? (
              <span className="rounded-full bg-ok/10 px-3 py-1 text-ok">صورة الإعلان مضافة</span>
            ) : (
              <span className="rounded-full bg-warn/10 px-3 py-1 text-warn">بدون صورة إعلان</span>
            )}

            {ad.receipt_image_url ? (
              <span className="rounded-full bg-ok/10 px-3 py-1 text-ok">الإيصال مضاف</span>
            ) : (
              <span className="rounded-full bg-warn/10 px-3 py-1 text-warn">الإيصال غير مضاف</span>
            )}
          </div>

          {ad.review_note ? (
            <div className="mt-4 rounded-2xl bg-warn/10 p-3 text-sm font-bold text-warn">
              ملاحظة المراجعة: {ad.review_note}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdsPage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [ads, setAds] = useState<MerchantAd[]>([]);
  const [form, setForm] = useState({
    title: "",
    target_category: "بقالة",
    amount_paid: "",
    image_url: "",
    receipt_image_url: "",
    description: "",
    requested_start_date: "",
    requested_end_date: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const result = await tajerApi.listAds(token, store.id);
      setAds(result.ads);
    }
  }

  useEffect(() => {
    reload()
      .catch(() => setMessage("تعذر تحميل الإعلانات. تأكد من تشغيل الباكند."))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const token = getStoredToken();
    const store = me?.stores[0];

    if (!token || !store) {
      setMessage("لم يتم العثور على متجر مرتبط بالحساب.");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description.trim() || undefined,
      target_category: form.target_category || undefined,
      image_url: form.image_url.trim() || undefined,
      receipt_image_url: form.receipt_image_url.trim() || undefined,
      amount_paid: form.amount_paid.trim() || undefined,
      requested_start_date: form.requested_start_date || undefined,
      requested_end_date: form.requested_end_date || undefined,
    };

    setSaving(true);
    try {
      await tajerApi.createAd(token, store.id, payload);

      setForm({
        title: "",
        target_category: "بقالة",
        amount_paid: "",
        image_url: "",
        receipt_image_url: "",
        description: "",
        requested_start_date: "",
        requested_end_date: "",
      });

      setMessage("تم إرسال طلب الإعلان للمراجعة بنجاح.");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر إرسال الإعلان.");
    } finally {
      setSaving(false);
    }
  }

  const pendingAds = ads.filter((ad) => ad.status === "pending_review").length;
  const approvedAds = ads.filter((ad) => ad.status === "approved" || ad.status === "active").length;

  const totalAdSpend = useMemo(() => {
    return ads.reduce((sum, ad) => {
      const amount = Number(ad.amount_paid || 0);
      if (!Number.isFinite(amount)) return sum;
      return sum + amount;
    }, 0);
  }, [ads]);

  return (
    <TajerShell>
      {loading ? (
        <LoadingState label="جاري تحميل طلبات الإعلانات..." />
      ) : (
        <>
          <section className="rounded-[2rem] bg-navy-900 p-6 text-ivory-50 shadow-card lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <p className="text-sm font-black text-gold-500">إعلاناتك</p>
                <h1 className="mt-3 text-3xl font-black leading-tight lg:text-5xl">
                  ودك تعلن معنا؟
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-ivory-100/72">
                  أرسل طلبك، ونراجعه قبل ظهوره في سوق ديوانية.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-gold-500/20 bg-white/7 p-5">
                <div className="flex items-center gap-3">
                  <Target className="text-gold-400" />
                  <p className="font-black">إعلان مرتب</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-ivory-100/70">
                  اكتب عنوانًا واضحًا، وأضف صورة مناسبة ووصفًا مختصرًا.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="surface p-5">
              <BadgePercent className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">طلبات الإعلان</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">{ads.length}</p>
            </div>

            <div className="surface p-5">
              <ClipboardList className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">قيد المراجعة / معتمد</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">
                {pendingAds} / {approvedAds}
              </p>
            </div>

            <div className="surface p-5">
              <DollarSign className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">إجمالي الدفعات المسجلة</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">
                {formatMoney(totalAdSpend)}
              </p>
              <p className="mt-1 text-sm text-ink-700/60">SAR</p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
            <form onSubmit={submit} className="surface p-5 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gold-500/12 p-3 text-gold-700">
                  <Plus size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-navy-900">طلب إعلان</h2>
                  <p className="mt-1 text-sm text-ink-700/60">سيتم إرساله للمراجعة قبل النشر.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-bold text-ink-700">عنوان الإعلان</label>
                  <input
                    className="input mt-2"
                    placeholder="مثال: عرض خاص للديوانيات"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">التصنيف المستهدف</label>
                  <select
                    className="input mt-2"
                    value={form.target_category}
                    onChange={(e) => setForm({ ...form, target_category: e.target.value })}
                  >
                    {marketplaceCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">المبلغ المدفوع</label>
                  <input
                    className="input mt-2"
                    placeholder="مثال: 250"
                    value={form.amount_paid}
                    onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-ink-700">تاريخ البداية</label>
                    <input
                      className="input mt-2"
                      type="date"
                      value={form.requested_start_date}
                      onChange={(e) => setForm({ ...form, requested_start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700">تاريخ النهاية</label>
                    <input
                      className="input mt-2"
                      type="date"
                      value={form.requested_end_date}
                      onChange={(e) => setForm({ ...form, requested_end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">رابط صورة الإعلان</label>
                  <input
                    className="input mt-2"
                    placeholder="اختياري حاليًا"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">رابط صورة الإيصال</label>
                  <input
                    className="input mt-2"
                    placeholder="اختياري حاليًا"
                    value={form.receipt_image_url}
                    onChange={(e) => setForm({ ...form, receipt_image_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">وصف الإعلان</label>
                  <textarea
                    className="input mt-2 min-h-28"
                    placeholder="اكتب العرض، المدة، أو سبب تميز الإعلان"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <button disabled={saving} className="btn-primary mt-5 w-full px-6 py-3 disabled:opacity-60">
                {saving ? "جاري الإرسال..." : "إرسال الإعلان للمراجعة"}
              </button>

              {message ? (
                <p className="mt-4 rounded-2xl bg-gold-500/10 p-3 text-sm font-bold text-gold-700">
                  {message}
                </p>
              ) : null}
            </form>

            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-navy-900">طلبات الإعلانات</h2>
                  <p className="mt-1 text-sm text-ink-700/60">
                    تابع حالة كل إعلان، قيمة الدفع، وفترة الإعلان المطلوبة.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => reload().catch(() => setMessage("تعذر تحديث الإعلانات."))}
                  className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-4 py-2 text-sm font-bold text-navy-900"
                >
                  <RefreshCw size={16} />
                  تحديث
                </button>
              </div>

              {ads.length === 0 ? (
                <div className="surface p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-500">
                    <Receipt size={34} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-navy-900">لا توجد طلبات إعلان بعد</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-ink-700/65">
                    أرسل أول طلب إعلان مدفوع. بعد المراجعة، يمكن ربطه لاحقًا بمواضع الظهور داخل سوق ديوانية.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ads.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              )}

              <div className="mt-5 rounded-[1.5rem] border border-gold-500/25 bg-gold-500/10 p-5">
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-gold-700" />
                  <h3 className="font-black text-navy-900">مهم قبل إطلاق الإعلانات فعليًا</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-ink-700/70">
                  الواجهة الحالية تسجل طلب الإعلان والإيصال كروابط. في المرحلة القادمة نضيف رفع ملفات آمن، مراجعة صور، وربط مواضع الإعلان داخل التطبيق.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </TajerShell>
  );
}
