"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Store,
} from "lucide-react";
import { getStoredToken, marketplaceCategories, tajerApi } from "@/lib/api";
import type { MerchantMeResponse } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { AuthGuard } from "@/components/auth-guard";
import { StatusChip } from "@/components/status-chip";
import { LoadingState } from "@/components/loading-state";

type StoreForm = {
  name: string;
  category: string;
  city_name_ar: string;
  district_name_ar: string;
  phone: string;
  whatsapp: string;
  google_maps_url: string;
  description: string;
};

function fieldValue(value?: string | null) {
  return value?.trim() || "";
}

function isHttpUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function StorePage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [form, setForm] = useState<StoreForm>({
    name: "",
    category: "بقالة",
    city_name_ar: "",
    district_name_ar: "",
    phone: "",
    whatsapp: "",
    google_maps_url: "",
    description: "",
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
      setForm({
        name: fieldValue(store.name),
        category: fieldValue(store.category) || "بقالة",
        city_name_ar: fieldValue(store.city_name_ar),
        district_name_ar: fieldValue(store.district_name_ar),
        phone: fieldValue(store.phone),
        whatsapp: fieldValue(store.whatsapp),
        google_maps_url: fieldValue(store.google_maps_url),
        description: fieldValue(store.description),
      });
    }
  }

  useEffect(() => {
    reload()
      .catch(() => setMessage("تعذر تحميل بيانات المتجر. حاول مرة أخرى."))
      .finally(() => setLoading(false));
  }, []);

  function setField(key: keyof StoreForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const token = getStoredToken();
    const store = me?.stores[0];

    if (!token || !store) {
      setMessage("لم يتم العثور على متجر مرتبط بالحساب.");
      return;
    }

    if (form.name.trim().length < 2) {
      setMessage("اسم المتجر مطلوب ويجب أن يكون واضحًا.");
      return;
    }
    if (!isHttpUrl(form.google_maps_url)) {
      setMessage("رابط الموقع يجب أن يبدأ بـ http أو https.");
      return;
    }

    setSaving(true);
    try {
      await tajerApi.updateStore(token, store.id, {
        name: form.name,
        category: form.category,
        city_name_ar: form.city_name_ar || undefined,
        district_name_ar: form.district_name_ar || undefined,
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        google_maps_url: form.google_maps_url || undefined,
        description: form.description || undefined,
      });

      setMessage("تم حفظ بيانات المتجر بنجاح.");
      await reload();
    } catch {
      setMessage("تعذر حفظ التعديلات. راجع الحقول وحاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  const store = me?.stores[0];

  return (
    <AuthGuard>
      <TajerShell>
      {loading ? (
        <LoadingState label="جاري تحميل بيانات المتجر..." />
      ) : (
        <>
          <section className="rounded-[2rem] bg-navy-900 p-6 text-ivory-50 shadow-card lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-black text-gold-500">بيانات المتجر</p>
                  <StatusChip status={store?.status} />
                </div>

                <h1 className="mt-3 text-3xl font-black leading-tight lg:text-5xl">
                  خلّ بيانات متجرك واضحة
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-8 text-ivory-100/72">
                  حدّث بيانات متجرك لتساعد الإدارة على مراجعتها بدقة. سيظهر ما يتم اعتماده داخل التطبيق حسب الإعدادات المتاحة.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-gold-500/20 bg-white/7 p-5">
                <div className="flex items-center gap-3">
                  <CircleAlert className="text-gold-400" />
                  <p className="font-black">ملاحظة</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-ivory-100/70">
                  البيانات الواضحة تساعد الإدارة على مراجعة المتجر وتساعد مستخدمي التطبيق لاحقًا على فهم نشاطك.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="surface p-5">
              <Store className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">اسم المتجر</p>
              <p className="mt-2 text-2xl font-black text-navy-900">{store?.name || "—"}</p>
            </div>

            <div className="surface p-5">
              <Building2 className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">التصنيف</p>
              <p className="mt-2 text-2xl font-black text-navy-900">{store?.category || "—"}</p>
            </div>

            <div className="surface p-5">
              <MapPin className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">الموقع</p>
              <p className="mt-2 text-2xl font-black text-navy-900">
                {[store?.city_name_ar, store?.district_name_ar].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
            <form onSubmit={submit} className="surface p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gold-500/12 p-3 text-gold-700">
                  <Save size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-navy-900">تحديث البيانات</h2>
                  <p className="mt-1 text-sm text-ink-700/60">اكتب البيانات التي ترغب بمراجعتها من الإدارة.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-bold text-ink-700">اسم المتجر <span className="text-err">*</span></label>
                  <input
                    className="input mt-2"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">التصنيف</label>
                  <select
                    className="input mt-2"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    {marketplaceCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-ink-700">المدينة</label>
                    <input
                      className="input mt-2"
                      value={form.city_name_ar}
                      onChange={(e) => setField("city_name_ar", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700">الحي</label>
                    <input
                      className="input mt-2"
                      value={form.district_name_ar}
                      onChange={(e) => setField("district_name_ar", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-ink-700">رقم الاتصال</label>
                    <input
                      className="input mt-2"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700">واتساب</label>
                    <input
                      className="input mt-2"
                      value={form.whatsapp}
                      onChange={(e) => setField("whatsapp", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">رابط الموقع على الخريطة</label>
                  <input
                    className="input mt-2"
                    placeholder="https://maps.google.com/?q=..."
                    value={form.google_maps_url}
                    onChange={(e) => setField("google_maps_url", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">وصف المتجر</label>
                  <textarea
                    className="input mt-2 min-h-28"
                    placeholder="وصف مختصر وواضح"
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                </div>
              </div>

              <button disabled={saving} className="btn-primary mt-5 w-full px-6 py-3 disabled:opacity-60">
                {saving ? "جاري الحفظ..." : "حفظ البيانات"}
              </button>

              {message ? (
                <p className="mt-4 rounded-2xl bg-gold-500/10 p-3 text-sm font-bold text-gold-700">
                  {message}
                </p>
              ) : null}
            </form>

            <div className="space-y-5">
              <div className="surface p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-navy-900">معاينة مختصرة</h2>
                    <p className="mt-1 text-sm text-ink-700/60">معاينة للبيانات التي تراجعها الإدارة.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => reload().catch(() => setMessage("تعذر تحديث البيانات. حاول مرة أخرى."))}
                    className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-4 py-2 text-sm font-bold text-navy-900"
                  >
                    <RefreshCw size={16} />
                    تحديث
                  </button>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-sand-400/25 bg-ivory-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-500">
                      <Store size={26} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-navy-900">{form.name || "بيانات المتجر غير مكتملة"}</h3>
                      <p className="mt-1 text-sm text-ink-700/65">
                        {[form.category, form.city_name_ar, form.district_name_ar].filter(Boolean).join(" · ") || "التصنيف والموقع"}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-ink-700/70">
                        {form.description || "أضف وصفًا مختصرًا يساعد الإدارة على فهم نشاط المتجر."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface p-6">
                <h2 className="text-xl font-black text-navy-900">وسائل التواصل</h2>
                <div className="mt-5 grid gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ivory-50 p-4">
                    <div className="flex items-center gap-3">
                      <Phone className="text-gold-700" size={20} />
                      <span className="font-bold text-ink-700">اتصال</span>
                    </div>
                    <span className="num break-all font-black text-navy-900">{form.phone || "—"}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ivory-50 p-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="text-gold-700" size={20} />
                      <span className="font-bold text-ink-700">واتساب</span>
                    </div>
                    <span className="num break-all font-black text-navy-900">{form.whatsapp || "—"}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ivory-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-gold-700" size={20} />
                      <span className="font-bold text-ink-700">الحالة</span>
                    </div>
                    <StatusChip status={store?.status} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      </TajerShell>
    </AuthGuard>
  );
}
