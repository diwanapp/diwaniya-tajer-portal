"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredToken, setStoredToken, tajerApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/dashboard");
      return;
    }
    setChecking(false);
  }, [router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب.");
      return;
    }
    if (!password.trim()) {
      setError("كلمة المرور مطلوبة.");
      return;
    }

    setLoading(true);
    try {
      const result = await tajerApi.login({ email, password });
      setStoredToken(result.access_token);
      router.push("/dashboard");
    } catch {
      setError("تعذر تسجيل الدخول. تأكد من البيانات وحاول مرة أخرى.");
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
            نتحقق من حالة الدخول قبل فتح الصفحة.
          </p>
        </div>
      </main>
    );
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
              دخول آمن لإدارة بيانات المتجر والمنتجات وطلبات الإعلان بعد مراجعة الإدارة.
            </p>
          </div>
          <p className="text-sm text-ivory-100/60">tajer.diwaniya.online</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-5">
        <form onSubmit={submit} className="surface w-full max-w-md p-6 lg:p-8">
          <p className="text-sm font-bold text-gold-700">ديوانية</p>
          <h2 className="mt-2 text-3xl font-black text-navy-900">تسجيل دخول التاجر</h2>
          <p className="mt-2 text-sm leading-7 text-ink-700/75">
            أدخل بياناتك للوصول إلى بوابة متجرك.
          </p>

          <label className="mt-6 block text-sm font-bold text-ink-700">البريد الإلكتروني</label>
          <input
            className="input mt-2"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="mt-4 block text-sm font-bold text-ink-700">كلمة المرور</label>
          <input
            className="input mt-2"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <p className="mt-4 rounded-2xl bg-err/10 p-3 text-sm font-bold text-err">{error}</p> : null}

          <button disabled={loading} className="btn-primary mt-6 w-full px-5 py-3 disabled:opacity-60">
            {loading ? "جاري تسجيل الدخول..." : "دخول بوابة التاجر"}
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
