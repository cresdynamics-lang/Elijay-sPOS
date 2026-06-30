"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, getUser, hasPermission, PERMS } from "@/lib/auth";
import type { Category } from "@/lib/catalog";

type Shop = { id: string; name: string };

type Variant = {
  id: string;
  product: string;
  category: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  price: number;
  stock?: number;
};

type CartLine = {
  key: string;
  variant_id: string;
  product: string;
  variant_label: string;
  list_price: number;
  sale_price: number;
  quantity: number;
};

function variantLabel(v: Variant) {
  const parts = [v.color, v.size ? `Size ${v.size}` : null].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Standard";
}

type Props = {
  categories: Category[];
};

export function PosTerminal({ categories }: Props) {
  const me = getUser();
  const canCheckout = hasPermission(me, PERMS.salesCreate);

  const [shops, setShops] = useState<Shop[]>([]);
  const [sellingStore, setSellingStore] = useState("");
  const [parentSlug, setParentSlug] = useState<string | null>(categories[0]?.slug ?? null);
  const [subSlug, setSubSlug] = useState<string | null>(categories[0]?.children?.[0]?.slug ?? null);
  const [search, setSearch] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState("cash");
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [msg, setMsg] = useState("");

  const activeParent = useMemo(
    () => categories.find((c) => c.slug === parentSlug) ?? null,
    [categories, parentSlug],
  );

  const categorySlug = subSlug ?? parentSlug ?? "";

  useEffect(() => {
    apiFetch<{ shops: Shop[] }>("/shops")
      .then((d) => {
        const list = d.shops ?? [];
        setShops(list);
        const defaultShop = me?.shop_id || list[0]?.id || "";
        if (defaultShop) setSellingStore((s) => s || defaultShop);
      })
      .catch(() => {});
  }, [me?.shop_id]);

  const loadVariants = useCallback(() => {
    if (!sellingStore) return;
    const params = new URLSearchParams({ shop_id: sellingStore });
    if (categorySlug) params.set("category_slug", categorySlug);
    if (search.trim()) params.set("q", search.trim());
    apiFetch<{ variants: Variant[] }>(`/variants?${params}`)
      .then((d) => setVariants(d.variants ?? []))
      .catch(() => setVariants([]));
  }, [sellingStore, categorySlug, search]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const subtotal = cart.reduce((s, c) => s + c.sale_price * c.quantity, 0);
  const lineDiscount = cart.reduce(
    (s, c) => s + Math.max(0, (c.list_price - c.sale_price) * c.quantity),
    0,
  );
  const netTotal = Math.max(0, subtotal - overallDiscount);

  function addToCart(v: Variant) {
    if ((v.stock ?? 0) < 1) {
      setMsg("Out of stock at this shop");
      return;
    }
    const key = v.id;
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        if (existing.quantity >= (v.stock ?? 0)) return prev;
        return prev.map((c) =>
          c.key === key ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          key,
          variant_id: v.id,
          product: v.product,
          variant_label: variantLabel(v),
          list_price: v.price,
          sale_price: v.price,
          quantity: 1,
        },
      ];
    });
    setMsg("");
  }

  function updateLine(key: string, patch: Partial<CartLine>) {
    setCart((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }

  async function checkout() {
    if (!sellingStore || cart.length === 0 || !canCheckout) return;
    setMsg("");
    try {
      const res = await apiFetch<{ order_id: string; net_total: number }>("/sales/checkout", {
        method: "POST",
        body: JSON.stringify({
          shop_id: sellingStore,
          payment_method: payment,
          overall_discount: overallDiscount,
          items: cart.map((c) => ({
            product_variant_id: c.variant_id,
            quantity: c.quantity,
            sale_price: c.sale_price,
          })),
        }),
      });
      setMsg(`Sale complete — KES ${res.net_total.toLocaleString()} (${payment})`);
      setCart([]);
      setOverallDiscount(0);
      loadVariants();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Checkout failed");
    }
  }

  const lockedStore = Boolean(me?.shop_id && (me.role === "shop_manager" || me.role === "cashier"));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Store</label>
            <select
              value={sellingStore}
              onChange={(e) => setSellingStore(e.target.value)}
              disabled={lockedStore}
              className="neu-inset px-3 py-2 text-sm"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs text-[var(--muted)]">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Product or SKU"
              className="neu-inset w-full px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="neu-flat p-4">
          <p className="mb-3 text-xs uppercase tracking-widest text-[var(--muted)]">Categories</p>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setParentSlug(cat.slug);
                  setSubSlug(cat.children?.[0]?.slug ?? null);
                }}
                className={`neu-btn shrink-0 px-4 py-2 text-sm ${
                  parentSlug === cat.slug ? "active accent-text" : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {activeParent && (activeParent.children?.length ?? 0) > 0 && (
            <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto">
              {activeParent.children!.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => setSubSlug(sub.slug)}
                  className={`neu-btn shrink-0 px-3 py-1.5 text-xs ${
                    subSlug === sub.slug ? "active accent-text" : ""
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="neu-flat max-h-[480px] overflow-y-auto">
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={(v.stock ?? 0) < 1}
                onClick={() => addToCart(v)}
                className="neu-inset p-4 text-left transition-opacity disabled:opacity-40"
              >
                <p className="font-medium">{v.product}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{variantLabel(v)}</p>
                <p className="mt-2 text-sm font-semibold accent-text">KES {v.price.toLocaleString()}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Stock: {v.stock ?? 0}</p>
              </button>
            ))}
            {variants.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-[var(--muted)]">
                No products in this category.
              </p>
            )}
          </div>
        </div>
      </section>

      <aside className="sticky top-4 flex max-h-[calc(100vh-6rem)] flex-col self-start neu-flat p-4">
        <h2 className="mb-3 shrink-0 text-sm font-semibold uppercase accent-text">Current sale</h2>
        <div className="neu-inset min-h-0 flex-1 space-y-3 overflow-y-auto p-3 text-sm">
          {cart.length === 0 && <p className="text-[var(--muted)]">Tap products to add to cart.</p>}
          {cart.map((line) => (
            <div key={line.key} className="border-b border-[var(--shadow-dark)]/20 pb-3">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{line.product}</p>
                  <p className="text-xs text-[var(--muted)]">{line.variant_label}</p>
                </div>
                <button type="button" className="text-xs text-red-700" onClick={() => removeLine(line.key)}>
                  Remove
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })}
                  className="neu-inset w-14 px-2 py-1 text-xs"
                />
                <input
                  type="number"
                  min={0}
                  value={line.sale_price}
                  onChange={(e) => updateLine(line.key, { sale_price: Number(e.target.value) })}
                  className="neu-inset w-24 px-2 py-1 text-xs"
                  title="Sale price"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 shrink-0 space-y-3 border-t border-[var(--shadow-dark)]/20 pt-4 text-sm">
          {lineDiscount > 0 && (
            <div className="flex justify-between text-xs text-red-700">
              <span>Item discounts</span>
              <span>−KES {lineDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--muted)]">Extra discount</label>
            <input
              type="number"
              min={0}
              value={overallDiscount || ""}
              onChange={(e) => setOverallDiscount(Number(e.target.value))}
              className="neu-inset flex-1 px-2 py-1 text-xs"
            />
          </div>
          <div className="flex gap-2">
            {(["cash", "mpesa", "card"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPayment(m)}
                className={`neu-btn flex-1 py-2 text-xs capitalize ${payment === m ? "active accent-text" : ""}`}
              >
                {m === "mpesa" ? "M-Pesa" : m}
              </button>
            ))}
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="accent-text">KES {netTotal.toLocaleString()}</span>
          </div>
          <button
            type="button"
            disabled={!canCheckout || cart.length === 0}
            onClick={checkout}
            className="neu-btn w-full py-3 font-semibold accent-text disabled:opacity-50"
          >
            Complete sale
          </button>
          {msg && <p className="text-xs text-[var(--muted)]">{msg}</p>}
        </div>
      </aside>
    </div>
  );
}
