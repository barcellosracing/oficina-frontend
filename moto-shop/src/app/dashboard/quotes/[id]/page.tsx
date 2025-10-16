"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Quote = {
  id: string;
  customer_id: string;
  customers?: { full_name?: string | null; email?: string | null } | null;
};

type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: q } = await supabase
        .from("quotes")
        .select("id, customer_id, customers!inner(full_name, email)")
        .eq("id", id)
        .single();
      const { data: i } = await supabase.from("quote_items").select("id, description, quantity, unit_price_cents, line_total_cents").eq("quote_id", id).order("id");
      setQuote(q as unknown as Quote);
      setItems(i || []);
    })();
  }, [id, supabase]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, l) => sum + (l.line_total_cents || 0), 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  const convertToOrder = async () => {
    setError(null);
    if (!quote) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("orders").insert({ owner: user?.id, customer_id: quote.customer_id, quote_id: quote.id, subtotal_cents: totals.subtotal, tax_cents: totals.tax, total_cents: totals.total, status: "open" });
    if (error) { setError(error.message); return; }
    await supabase.from("quotes").update({ status: "converted" }).eq("id", quote.id);
    router.push("/dashboard/reports");
  };

  if (!quote) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quote #{quote.id.slice(0, 8)}</h2>
        <button className="rounded-lg bg-black text-white px-3 py-1.5" onClick={convertToOrder}>Convert to order</button>
      </div>
      <div className="rounded-xl border p-4 bg-white dark:bg-zinc-900">
        <div className="font-medium mb-2">Customer</div>
        <div className="text-sm">{quote.customers?.full_name} {quote.customers?.email ? `• ${quote.customers.email}` : ""}</div>
      </div>
      <div className="rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Qty</th>
              <th className="text-right p-3">Unit Price</th>
              <th className="text-right p-3">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.description}</td>
                <td className="p-3 text-right">{l.quantity}</td>
                <td className="p-3 text-right">${((l.unit_price_cents || 0) / 100).toFixed(2)}</td>
                <td className="p-3 text-right">${((l.line_total_cents || 0) / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
