"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Customer = { id: string; full_name: string };

type CatalogItem = { id: string; label: string; price_cents: number; type: "product" | "service" };

type Line = { key: string; item?: CatalogItem; quantity: number; description: string; unit_price_cents: number; line_total_cents: number };

export default function NewQuotePage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [cust, prod, serv] = await Promise.all([
        supabase.from("customers").select("id, full_name").order("full_name"),
        supabase.from("products").select("id, name, price_cents"),
        supabase.from("services").select("id, name, rate_cents"),
      ]);
      setCustomers(cust.data || []);
      const catalogItems: CatalogItem[] = [
        ...(prod.data || []).map((p) => ({ id: p.id, label: p.name, price_cents: p.price_cents || 0, type: "product" as const })),
        ...(serv.data || []).map((s) => ({ id: s.id, label: s.name, price_cents: s.rate_cents || 0, type: "service" as const })),
      ];
      setCatalog(catalogItems);
      setLines([{ key: crypto.randomUUID(), quantity: 1, description: "", unit_price_cents: 0, line_total_cents: 0 }]);
    })();
  }, [supabase]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.line_total_cents, 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [lines]);

  const updateLine = (idx: number, updater: (l: Line) => Line) => {
    setLines((prev) => {
      const arr = [...prev];
      const updated = updater(arr[idx]);
      updated.line_total_cents = updated.quantity * updated.unit_price_cents;
      arr[idx] = updated;
      return arr;
    });
  };

  const addLine = () => setLines((prev) => [...prev, { key: crypto.randomUUID(), quantity: 1, description: "", unit_price_cents: 0, line_total_cents: 0 }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const onSave = async () => {
    setSaving(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: quote, error: qErr } = await supabase.from("quotes").insert({ owner: user?.id, customer_id: customerId, status: "draft", subtotal_cents: totals.subtotal, tax_cents: totals.tax, total_cents: totals.total }).select().single();
    if (qErr) { setError(qErr.message); setSaving(false); return; }
    const items = lines.map((l) => ({ owner: user?.id, quote_id: quote.id, item_type: l.item?.type || "product", item_id: l.item?.id || crypto.randomUUID(), description: l.description || l.item?.label || "Item", quantity: l.quantity, unit_price_cents: l.unit_price_cents, line_total_cents: l.line_total_cents }));
    const { error: iErr } = await supabase.from("quote_items").insert(items);
    if (iErr) { setError(iErr.message); setSaving(false); return; }
    router.push(`/dashboard/quotes/${quote.id}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">New quote</h2>
      <div className="grid gap-4 max-w-3xl">
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select className="w-full rounded-lg border px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Items</div>
            <button className="rounded-lg border px-3 py-1.5" onClick={addLine}>Add item</button>
          </div>
          <div className="space-y-3">
            {lines.map((l, idx) => (
              <div key={l.key} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <div className="md:col-span-3">
                  <select className="w-full rounded-lg border px-3 py-2" value={l.item?.id || ""} onChange={(e) => {
                    const item = catalog.find((c) => c.id === e.target.value);
                    updateLine(idx, (prev) => ({ ...prev, item, description: item?.label || prev.description, unit_price_cents: item?.price_cents || 0 }));
                  }}>
                    <option value="">Custom</option>
                    {catalog.map((c) => (
                      <option key={c.id} value={c.id}>{c.type === "service" ? "Service: " : "Product: "}{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <input className="w-full rounded-lg border px-3 py-2" placeholder="Description" value={l.description} onChange={(e) => updateLine(idx, (prev) => ({ ...prev, description: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <input type="number" min={1} className="w-full rounded-lg border px-3 py-2" value={l.quantity} onChange={(e) => updateLine(idx, (prev) => ({ ...prev, quantity: Number(e.target.value) || 1 }))} />
                </div>
                <div className="md:col-span-2">
                  <input type="number" step="0.01" className="w-full rounded-lg border px-3 py-2" value={(l.unit_price_cents / 100).toString()} onChange={(e) => updateLine(idx, (prev) => ({ ...prev, unit_price_cents: Math.round(Number(e.target.value) * 100) }))} />
                </div>
                <div className="md:col-span-1 text-right">${(l.line_total_cents / 100).toFixed(2)}</div>
                <div className="md:col-span-12 text-right">
                  <button className="text-sm text-red-600" onClick={() => removeLine(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-sm ml-auto">
          <div className="col-span-1 text-zinc-500">Subtotal</div>
          <div className="col-span-1 md:col-span-2 text-right font-medium">${(totals.subtotal / 100).toFixed(2)}</div>
          <div className="col-span-1 text-zinc-500">Tax (10%)</div>
          <div className="col-span-1 md:col-span-2 text-right font-medium">${(totals.tax / 100).toFixed(2)}</div>
          <div className="col-span-1 text-zinc-500">Total</div>
          <div className="col-span-1 md:col-span-2 text-right font-semibold">${(totals.total / 100).toFixed(2)}</div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button disabled={!customerId || saving} className="rounded-lg bg-black text-white px-4 py-2" onClick={onSave}>Save quote</button>
          <button className="rounded-lg border px-4 py-2" onClick={() => history.back()}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
