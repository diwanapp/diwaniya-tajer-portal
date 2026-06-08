"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      window.location.replace("/login");
      return;
    }

    setAllowed(true);
    setChecked(true);
  }, []);

  if (!checked || !allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory-50 p-6">
        <div className="surface max-w-md p-6 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-gold-500/20" />
          <h1 className="mt-5 text-xl font-black text-navy-900">جاري التحقق</h1>
          <p className="mt-2 text-sm leading-7 text-ink-700/65">
            نتحقق من الدخول قبل فتح الصفحة.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
