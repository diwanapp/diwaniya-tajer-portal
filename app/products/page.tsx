"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  ImageIcon,
  PackagePlus,
  PackageSearch,
  Plus,
  RefreshCw,
  CircleDollarSign,
} from "lucide-react";
import { marketplaceCategories, getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantMeResponse, MerchantProduct } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { AuthGuard } from "@/components/auth-guard";
import { StatusChip } from "@/components/status-chip";
import { LoadingState } from "@/components/loading-state";

function formatMoney(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return value.toLocaleString("ar-SA", {
    maximumFractionDigits: 2,
  });
}

function ProductCard({ product }: { product: MerchantProduct }) {
  return (
    <div className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-500">
          {product.image_url ? <ImageIcon size={24} /> : <Boxes size={24} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-navy-900">{product.name}</h3>
              <p className="mt-1 text-sm text-ink-700/65">{product.category}</p>
            </div>
            <StatusChip status={product.status} />
          </div>

          {product.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-ink-700/65">
              {product.description}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-ink-700/45">
              لا يوجد وصف مختصر للمنتج.
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ivory-50 p-3">
              <p className="text-xs font-bold text-ink-700/55">السعر</p>
              <p className="num mt-1 text-lg font-black text-navy-900">
                {product.price} {product.currency}
              </p>
            </div>
            <div className="rounded-2xl bg-ivory-50 p-3">
              <p className="text-xs font-bold text-ink-700/55">المخزون</p>
              <p className="num mt-1 text-lg font-black text-navy-900">
                {product.stock_quantity}
              </p>
            </div>
          </div>

          {product.review_note ? (
            <div className="mt-4 rounded-2xl bg-warn/10 p-3 text-sm font-bold text-warn">
              ملاحظة المراجعة: {product.review_note}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "بقالة",
    price: "",
    stock_quantity: 0,
    description: "",
    image_url: "",
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
      const result = await tajerApi.listProducts(token, store.id);
      setProducts(result.products);
    }
  }

  useEffect(() => {
    reload()
      .catch(() => setMessage("تعذر تحميل المنتجات. تأكد من تشغيل الباكند."))
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

    setSaving(true);
    try {
      await tajerApi.createProduct(token, store.id, {
        ...form,
        price: form.price,
        stock_quantity: Number(form.stock_quantity),
      });

      setForm({
        name: "",
        category: "بقالة",
        price: "",
        stock_quantity: 0,
        description: "",
        image_url: "",
      });

      setMessage("تم إرسال المنتج للمراجعة بنجاح.");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذر إضافة المنتج.");
    } finally {
      setSaving(false);
    }
  }

  const pendingProducts = products.filter((product) => product.status === "pending_review").length;
  const approvedProducts = products.filter(
    (product) => product.status === "approved" || product.status === "active",
  ).length;

  const stockValue = useMemo(() => {
    return products.reduce((sum, product) => {
      const price = Number(product.price);
      const quantity = Number(product.stock_quantity);
      if (!Number.isFinite(price) || !Number.isFinite(quantity)) return sum;
      return sum + price * quantity;
    }, 0);
  }, [products]);

  return (
    <AuthGuard>
      <TajerShell>
      {loading ? (
        <LoadingState label="جاري تحميل منتجات المتجر..." />
      ) : (
        <>
          <section className="rounded-[2rem] bg-navy-900 p-6 text-ivory-50 shadow-card lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <p className="text-sm font-black text-gold-500">إدارة المنتجات</p>
                <h1 className="mt-3 text-3xl font-black leading-tight lg:text-5xl">
                  أضف منتجاتك وأسعارك ومخزونك بسهولة
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-ivory-100/72">
                  كل منتج جديد أو معدل يتم إرساله للمراجعة قبل الظهور في سوق ديوانية، لضمان جودة وموثوقية السوق.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-gold-500/20 bg-white/7 p-5">
                <div className="flex items-center gap-3">
                  <PackagePlus className="text-gold-400" />
                  <p className="font-black">نصيحة للتاجر</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-ivory-100/70">
                  المنتج ذو الاسم الواضح، السعر المحدد، والمخزون المحدث يعطي ثقة أعلى ويزيد احتمالية التواصل.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="surface p-5">
              <Boxes className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">إجمالي المنتجات</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">{products.length}</p>
            </div>

            <div className="surface p-5">
              <CheckCircle2 className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">قيد المراجعة / معتمد</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">
                {pendingProducts} / {approvedProducts}
              </p>
            </div>

            <div className="surface p-5">
              <CircleDollarSign className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">قيمة المخزون التقريبية</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">
                {formatMoney(stockValue)}
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
                  <h2 className="text-xl font-black text-navy-900">إضافة منتج</h2>
                  <p className="mt-1 text-sm text-ink-700/60">سيتم إرساله للمراجعة قبل النشر.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-bold text-ink-700">اسم المنتج</label>
                  <input
                    className="input mt-2"
                    placeholder="مثال: شاهي ممتاز"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">التصنيف</label>
                  <select
                    className="input mt-2"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {marketplaceCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-ink-700">السعر</label>
                    <input
                      className="input mt-2"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700">الكمية</label>
                    <input
                      className="input mt-2"
                      placeholder="0"
                      type="number"
                      value={form.stock_quantity}
                      onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">رابط الصورة</label>
                  <input
                    className="input mt-2"
                    placeholder="اختياري حاليًا"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">وصف مختصر</label>
                  <textarea
                    className="input mt-2 min-h-28"
                    placeholder="وصف المنتج، المقاس، النوع، أو أي تفاصيل مهمة"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <button disabled={saving} className="btn-primary mt-5 w-full px-6 py-3 disabled:opacity-60">
                {saving ? "جاري الإرسال..." : "إرسال المنتج للمراجعة"}
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
                  <h2 className="text-2xl font-black text-navy-900">قائمة المنتجات</h2>
                  <p className="mt-1 text-sm text-ink-700/60">
                    تابع حالة كل منتج وسعره ومخزونه.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => reload().catch(() => setMessage("تعذر تحديث المنتجات."))}
                  className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-4 py-2 text-sm font-bold text-navy-900"
                >
                  <RefreshCw size={16} />
                  تحديث
                </button>
              </div>

              {products.length === 0 ? (
                <div className="surface p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-500">
                    <PackageSearch size={34} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-navy-900">لا توجد منتجات بعد</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-ink-700/65">
                    أضف أول منتج في متجرك. بعد المراجعة، يصبح جاهزًا للظهور في سوق ديوانية.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
      </TajerShell>
    </AuthGuard>
  );
}
