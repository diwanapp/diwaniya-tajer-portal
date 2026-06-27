"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredToken, marketplaceCategories, setStoredToken, tajerApi } from "@/lib/api";
import type { GeoCity, GeoDistrict } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    display_name: "",
    phone: "",
    store_name: "",
    category: "بقالة",
    city_id: "",
    district_id: "",
    city_name_ar: "",
    district_name_ar: "",
    whatsapp: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [cities, setCities] = useState<GeoCity[]>([]);
  const [districts, setDistricts] = useState<GeoDistrict[]>([]);

  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/dashboard");
      return;
    }
    setChecking(false);
  }, [router]);

  useEffect(() => {
    void tajerApi.geoCities().then(setCities).catch(() => setCities([]));
  }, []);

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectCity(cityId: string) {
    const city = cities.find((item) => item.id === cityId);
    setDistricts([]);
    setForm((current) => ({
      ...current,
      city_id: cityId,
      city_name_ar: city?.name_ar || "",
      district_id: "",
      district_name_ar: "",
    }));
    if (cityId) {
      void tajerApi.geoDistricts(cityId).then(setDistricts).catch(() => setDistricts([]));
    }
  }

  function selectDistrict(districtId: string) {
    const district = districts.find((item) => item.id === districtId);
    setForm((current) => ({
      ...current,
      district_id: districtId,
      district_name_ar: district?.name_ar || "",
    }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("البريد الإلكتروني مطلوب.");
      return;
    }
    if (!form.password.trim()) {
      setError("كلمة المرور مطلوبة.");
      return;
    }
    if (form.password.length < 8 || !/[A-Za-z\u0600-\u06FF]/.test(form.password) || !/\d/.test(form.password)) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل وتشمل حرفًا ورقمًا.");
      return;
    }
    if (!form.store_name.trim()) {
      setError("اسم المتجر مطلوب.");
      return;
    }

    setLoading(true);
    try {
      const result = await tajerApi.register(form);
      setStoredToken(result.access_token);
      router.push("/dashboard");
    } catch {
      setError("تعذر إنشاء الحساب. راجع الحقول وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory-50 p-6">
        <div className="surface max-w-md p-6 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-gold-500/20" />
          <h1 className="mt-5 text-xl font-black text-navy-900">جاري التحقق</h1>
          <p className="mt-2 text-sm leading-7 text-ink-700/65">
            نتحقق من حالة الدخول قبل فتح صفحة التسجيل.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory-50 p-5 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-gold-700">بوابة التجار</p>
            <h1 className="text-3xl font-black text-navy-900">إنشاء حساب تاجر</h1>
            <p className="mt-2 text-sm leading-7 text-ink-700/65">
              أرسل بيانات نشاطك ليتم مراجعتها من الإدارة.
            </p>
          </div>
          <Link href="/login" className="rounded-full border border-sand-400/40 px-5 py-2 text-sm font-bold">
            لدي حساب
          </Link>
        </div>

        <form onSubmit={submit} className="surface p-6 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="text-sm font-bold">البريد الإلكتروني <span className="text-err">*</span></label>
              <input className="input mt-2" type="email" autoComplete="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-bold">كلمة المرور <span className="text-err">*</span></label>
              <input className="input mt-2" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setField("password", e.target.value)} required />
              <p className="mt-1 text-xs text-ink-700/60">8 أحرف على الأقل وتشمل حرفًا ورقمًا.</p>
            </div>
            <div>
              <label className="text-sm font-bold">اسم التاجر</label>
              <input className="input mt-2" value={form.display_name} onChange={(e) => setField("display_name", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold">رقم الجوال</label>
              <input className="input mt-2" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold">اسم المتجر <span className="text-err">*</span></label>
              <input className="input mt-2" value={form.store_name} onChange={(e) => setField("store_name", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-bold">التصنيف</label>
              <select className="input mt-2" value={form.category} onChange={(e) => setField("category", e.target.value)}>
                {marketplaceCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold">المدينة</label>
              <select className="input mt-2" value={form.city_id} onChange={(e) => selectCity(e.target.value)}>
                <option value="">اختر المدينة</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold">الحي</label>
              <select
                className="input mt-2"
                value={form.district_id}
                onChange={(e) => selectDistrict(e.target.value)}
                disabled={!form.city_id}
              >
                <option value="">كل المدينة</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold">واتساب المتجر</label>
              <input className="input mt-2" value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} />
            </div>
            <div className="lg:col-span-2">
              <label className="text-sm font-bold">وصف مختصر</label>
              <textarea className="input mt-2 min-h-28" value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
          </div>

          {error ? <p className="mt-5 rounded-2xl bg-err/10 p-3 text-sm font-bold text-err">{error}</p> : null}

          <button disabled={loading} className="btn-primary mt-6 px-8 py-3 disabled:opacity-60">
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب تاجر"}
          </button>
        </form>
      </div>
    </main>
  );
}
