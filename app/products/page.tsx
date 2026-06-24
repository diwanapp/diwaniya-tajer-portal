"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  PackagePlus,
  PackageSearch,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { marketplaceCategories, getStoredToken, tajerApi } from "@/lib/api";
import type { MerchantMeResponse, MerchantProduct } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { AuthGuard } from "@/components/auth-guard";
import { StatusChip } from "@/components/status-chip";
import { LoadingState } from "@/components/loading-state";

function isHttpUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

type ProductFilterKey = "all" | "pending" | "approved" | "rejected";

function productMatchesFilter(product: MerchantProduct, filter: ProductFilterKey) {
  if (filter === "all") return true;
  if (filter === "pending") return product.status === "pending_review";
  if (filter === "approved") return product.status === "approved" || product.status === "active";
  if (filter === "rejected") return product.status === "rejected";
  return true;
}

function ProductCard({ product }: { product: MerchantProduct }) {
  return (
    <div className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-navy-900 text-gold-500">
          {product.image_url ? (
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <Boxes size={24} />
          )}
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
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<ProductFilterKey>("all");
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
      .catch(() => setMessage("تعذر تحميل المنتجات. حاول مرة أخرى."))
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

    const price = Number(form.price);
    if (form.name.trim().length < 2) {
      setMessage("اسم المنتج مطلوب ويجب أن يكون واضحًا.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setMessage("اكتب سعرًا صحيحًا أكبر من صفر.");
      return;
    }
    if (!Number.isInteger(Number(form.stock_quantity)) || Number(form.stock_quantity) < 0) {
      setMessage("اكتب كمية صحيحة لا تقل عن صفر.");
      return;
    }
    if (!isHttpUrl(form.image_url)) {
      setMessage("رابط الصورة يجب أن يبدأ بـ http أو https.");
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

      setMessage("تم إرسال المنتج للمراجعة.");
      await reload();
    } catch {
      setMessage("تعذر إرسال المنتج للمراجعة. راجع الحقول وحاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  const pendingProducts = products.filter((product) => product.status === "pending_review").length;
  const approvedProducts = products.filter(
    (product) => product.status === "approved" || product.status === "active",
  ).length;
  const rejectedProducts = products.filter((product) => product.status === "rejected").length;
  const visibleProducts = products.filter((product) => {
    if (!productMatchesFilter(product, productFilter)) return false;
    const query = productSearch.trim().toLocaleLowerCase("ar-SA");
    if (!query) return true;
    return [product.name, product.category, product.description]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ar-SA")
      .includes(query);
  });
  const productFilters = [
    { key: "all" as const, label: "الكل", count: products.length },
    { key: "pending" as const, label: "قيد المراجعة", count: pendingProducts },
    { key: "approved" as const, label: "معتمد", count: approvedProducts },
    { key: "rejected" as const, label: "مرفوض", count: rejectedProducts },
  ];

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
                <p className="text-sm font-black text-gold-500">المنتجات</p>
                <h1 className="mt-3 text-3xl font-black leading-tight lg:text-5xl">
                  أضف منتجات متجرك لتعرض بشكل مميز
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-ivory-100/72">
                  أضف المنتجات والأسعار والمخزون، وتراجعها الإدارة قبل ظهورها داخل التطبيق.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-gold-500/20 bg-white/7 p-5">
                <div className="flex items-center gap-3">
                  <PackagePlus className="text-gold-400" />
                  <p className="font-black">جودة العرض</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-ivory-100/70">
                  الاسم الواضح والسعر المحدد والمخزون المحدث تساعد على تقديم منتج موثوق.
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
              <XCircle className="text-gold-700" />
              <p className="mt-4 text-sm text-ink-700/70">مرفوض</p>
              <p className="num mt-2 text-4xl font-black text-navy-900">{rejectedProducts}</p>
              <p className="mt-1 text-sm text-ink-700/60">راجع ملاحظة الإدارة إن وجدت.</p>
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
                  <p className="mt-1 text-sm text-ink-700/60">يرسل المنتج إلى الإدارة للمراجعة قبل ظهوره داخل التطبيق.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                    <label className="text-sm font-bold text-ink-700">اسم المنتج <span className="text-err">*</span></label>
                  <input
                    className="input mt-2"
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
                    <label className="text-sm font-bold text-ink-700">السعر <span className="text-err">*</span></label>
                    <input
                      className="input mt-2"
                      inputMode="decimal"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700">الكمية</label>
                    <input
                      className="input mt-2"
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
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-ink-700">وصف مختصر</label>
                  <textarea
                    className="input mt-2 min-h-28"
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
                  onClick={() => reload().catch(() => setMessage("تعذر تحديث المنتجات. حاول مرة أخرى."))}
                  className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-4 py-2 text-sm font-bold text-navy-900"
                >
                  <RefreshCw size={16} />
                  تحديث
                </button>
              </div>

              <div className="mb-4 rounded-[1.5rem] border border-sand-400/25 bg-white p-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {productFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setProductFilter(filter.key)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${
                        productFilter === filter.key
                          ? "border-gold-500/40 bg-gold-500/15 text-navy-900"
                          : "border-sand-400/35 bg-ivory-50 text-ink-700/70"
                      }`}
                    >
                      {filter.label}
                      <span className="num rounded-full bg-white px-2 py-0.5 text-[11px] text-ink-700/65">{filter.count}</span>
                    </button>
                  ))}
                </div>

                <label className="relative mt-4 block">
                  <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/45" size={18} />
                  <input
                    className="input pr-10"
                    aria-label="ابحث باسم المنتج أو التصنيف"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                  />
                </label>
              </div>

              {products.length === 0 ? (
                <div className="surface p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-500">
                    <PackageSearch size={34} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-navy-900">لا توجد منتجات مضافة حتى الآن.</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-ink-700/65">
                    أضف أول منتج ليتم مراجعته من الإدارة قبل ظهوره داخل التطبيق.
                  </p>
                </div>
              ) : visibleProducts.length === 0 ? (
                <div className="surface p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-500">
                    <Search size={34} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-navy-900">لا توجد نتائج مطابقة</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-ink-700/65">
                    غيّر التصفية أو امسح البحث لعرض المنتجات المحمّلة.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {visibleProducts.map((product) => (
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
