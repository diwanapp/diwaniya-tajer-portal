"use client";

import { useEffect, useState } from "react";
import { getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantMeResponse } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";

export default function StorePage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);

  useEffect(() => {
    async function load() {
      const token = getStoredToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      setMe(await tajerApi.me(token));
    }
    load().catch(() => undefined);
  }, []);

  const store = me?.stores[0];

  return (
    <TajerShell>
      <h1 className="text-3xl font-black text-navy-900">ملف المتجر</h1>
      <p className="mt-2 text-sm text-ink-700/70">
        هذه البيانات تظهر بعد المراجعة والاعتماد. التعديل الكامل سيضاف في المرحلة التالية.
      </p>

      <div className="surface mt-6 p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            ["اسم المتجر", store?.name ?? "—"],
            ["التصنيف", store?.category ?? "—"],
            ["المدينة", store?.city_name_ar ?? "—"],
            ["الحي", store?.district_name_ar ?? "—"],
            ["واتساب", store?.whatsapp ?? "—"],
            ["الحالة", store?.status ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-sand-400/25 bg-ivory-50 p-4">
              <p className="text-xs font-bold text-ink-700/60">{label}</p>
              <p className="mt-2 font-black text-navy-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </TajerShell>
  );
}
