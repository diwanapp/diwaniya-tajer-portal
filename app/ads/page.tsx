"use client";

import { useEffect, useState } from "react";
import { marketplaceCategories, getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantAd, MerchantMeResponse } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";

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
    reload().catch(() => setMessage("تعذر تحميل الإعلانات."));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const token = getStoredToken();
    const store = me?.stores[0];
    if (!token || !store) return;

    try {
      await tajerApi.createAd(token, store.id, form);
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
      setMessage("تم إرسال طلب الإعلان للمراجعة.");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر إرسال الإعلان.");
    }
  }

  return (
    <TajerShell>
      <h1 className="text-3xl font-black text-navy-900">الإعلانات</h1>
      <p className="mt-2 text-sm text-ink-700/70">
        ارفع طلب إعلان مدفوع. سيتم مراجعته قبل الظهور في سوق ديوانية.
      </p>

      <form onSubmit={submit} className="surface mt-6 p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <input className="input" placeholder="عنوان الإعلان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="input" value={form.target_category} onChange={(e) => setForm({ ...form, target_category: e.target.value })}>
            {marketplaceCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <input className="input" placeholder="المبلغ المدفوع" value={form.amount_paid} onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} />
          <input className="input" placeholder="رابط صورة الإعلان" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <input className="input" placeholder="رابط صورة الإيصال" value={form.receipt_image_url} onChange={(e) => setForm({ ...form, receipt_image_url: e.target.value })} />
          <input className="input" type="date" value={form.requested_start_date} onChange={(e) => setForm({ ...form, requested_start_date: e.target.value })} />
          <input className="input" type="date" value={form.requested_end_date} onChange={(e) => setForm({ ...form, requested_end_date: e.target.value })} />
        </div>
        <textarea className="input mt-4 min-h-24" placeholder="وصف الإعلان" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary mt-4 px-6 py-3">إرسال الإعلان للمراجعة</button>
        {message ? <p className="mt-3 text-sm font-bold text-gold-700">{message}</p> : null}
      </form>

      <div className="mt-6 grid gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="surface flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-black text-navy-900">{ad.title}</p>
              <p className="mt-1 text-sm text-ink-700/65">{ad.target_category ?? "كل التصنيفات"} · {ad.status}</p>
            </div>
            <div className="text-left">
              <p className="num font-black text-navy-900">{ad.amount_paid ?? "—"} {ad.currency}</p>
              <p className="text-sm text-ink-700/65">قيد المراجعة</p>
            </div>
          </div>
        ))}
      </div>
    </TajerShell>
  );
}
