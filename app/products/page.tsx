"use client";

import { useEffect, useState } from "react";
import { marketplaceCategories, getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantMeResponse, MerchantProduct } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";

export default function ProductsPage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [form, setForm] = useState({ name: "", category: "بقالة", price: "", stock_quantity: 0, description: "", image_url: "" });
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
      const result = await tajerApi.listProducts(token, store.id);
      setProducts(result.products);
    }
  }

  useEffect(() => {
    reload().catch(() => setMessage("تعذر تحميل المنتجات."));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const token = getStoredToken();
    const store = me?.stores[0];
    if (!token || !store) return;

    try {
      await tajerApi.createProduct(token, store.id, {
        ...form,
        price: form.price,
        stock_quantity: Number(form.stock_quantity),
      });
      setForm({ name: "", category: "بقالة", price: "", stock_quantity: 0, description: "", image_url: "" });
      setMessage("تم إرسال المنتج للمراجعة.");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر إضافة المنتج.");
    }
  }

  return (
    <TajerShell>
      <h1 className="text-3xl font-black text-navy-900">المنتجات</h1>
      <p className="mt-2 text-sm text-ink-700/70">أضف منتجاتك وأسعارك ومخزونك. كل منتج جديد يرسل للمراجعة قبل الظهور.</p>

      <form onSubmit={submit} className="surface mt-6 p-5">
        <div className="grid gap-4 lg:grid-cols-5">
          <input className="input" placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {marketplaceCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <input className="input" placeholder="السعر" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className="input" placeholder="الكمية" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
          <input className="input" placeholder="رابط الصورة اختياري" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>
        <textarea className="input mt-4 min-h-24" placeholder="وصف مختصر" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary mt-4 px-6 py-3">إرسال المنتج للمراجعة</button>
        {message ? <p className="mt-3 text-sm font-bold text-gold-700">{message}</p> : null}
      </form>

      <div className="mt-6 grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="surface flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-black text-navy-900">{product.name}</p>
              <p className="mt-1 text-sm text-ink-700/65">{product.category} · {product.status}</p>
            </div>
            <div className="text-left">
              <p className="num font-black text-navy-900">{product.price} {product.currency}</p>
              <p className="text-sm text-ink-700/65">المخزون: {product.stock_quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </TajerShell>
  );
}
