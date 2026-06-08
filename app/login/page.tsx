"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setStoredToken, tajerApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("merchant@example.com");
  const [password, setPassword] = useState("Strong123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await tajerApi.login({ email, password });
      setStoredToken(result.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-ivory-50 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-navy-900 p-10 text-ivory-50 lg:block">
        <div className="flex h-full flex-col justify-between rounded-[2rem] border border-gold-500/25 bg-white/6 p-8">
          <div>
            <p className="text-sm font-black text-gold-500">بوابة التجار</p>
            <h1 className="mt-5 text-5xl font-black leading-tight">
              تابع متجرك وإعلاناتك من مكان واحد
            </h1>
            <p className="mt-5 text-lg leading-9 text-ivory-100/75">
              دخول آمن لإدارة منتجاتك، أسعارك، طلبات الإعلانات، ومؤشرات الأداء القادمة.
            </p>
          </div>
          <p className="text-sm text-ivory-100/60">tajer.diwaniya.online</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-5">
        <form onSubmit={submit} className="surface w-full max-w-md p-6 lg:p-8">
          <p className="text-sm font-bold text-gold-700">ديوانية</p>
          <h2 className="mt-2 text-3xl font-black text-navy-900">دخول التاجر</h2>
          <p className="mt-2 text-sm leading-7 text-ink-700/75">
            أدخل بريدك وكلمة المرور للوصول إلى بوابة التجار.
          </p>

          <label className="mt-6 block text-sm font-bold text-ink-700">البريد الإلكتروني</label>
          <input className="input mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="mt-4 block text-sm font-bold text-ink-700">كلمة المرور</label>
          <input
            className="input mt-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <p className="mt-4 rounded-2xl bg-err/10 p-3 text-sm font-bold text-err">{error}</p> : null}

          <button disabled={loading} className="btn-primary mt-6 w-full px-5 py-3 disabled:opacity-60">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>

          <p className="mt-5 text-center text-sm text-ink-700/70">
            لا تملك حسابًا؟{" "}
            <Link href="/register" className="font-black text-gold-700">
              سجل كتاجر
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
