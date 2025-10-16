"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function EditProductPage() {
  const supabase = createSupabaseBrowserClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ sku: "", name: "", price: "0", cost: "0", stock: "0", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setForm({
          sku: data.sku || "",
          name: data.name || "",
          price: ((data.price_cents || 0) / 100).toString(),
          cost: data.cost_cents != null ? (data.cost_cents / 100).toString() : "0",
          stock: String(data.stock || 0),
          description: data.description || "",
        });
      }
      setLoading(false);
    })();
  }, [id, supabase]);

  const onSave = async () => {
    setError(null);
    const { error } = await supabase
      .from("products")
      .update({
        sku: form.sku || null,
        name: form.name,
        description: form.description || null,
        price_cents: Math.round(Number(form.price) * 100),
        cost_cents: form.cost ? Math.round(Number(form.cost) * 100) : null,
        stock: Number(form.stock),
      })
      .eq("id", id);
    if (error) { setError(error.message); return; }
    router.push("/dashboard/products");
  };

  const onDelete = async () => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    router.push("/dashboard/products");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">Edit product</h2>
      <div className="grid gap-3">
        <label className="text-sm">SKU<input className="w-full rounded-lg border px-3 py-2" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
        <label className="text-sm">Name<input className="w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-sm">Price<input type="number" step="0.01" className="w-full rounded-lg border px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label className="text-sm">Cost<input type="number" step="0.01" className="w-full rounded-lg border px-3 py-2" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></label>
          <label className="text-sm">Stock<input type="number" className="w-full rounded-lg border px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
        </div>
        <label className="text-sm">Description<textarea rows={4} className="w-full rounded-lg border px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onSave} className="rounded-lg bg-black text-white px-4 py-2">Save</button>
        <button onClick={onDelete} className="rounded-lg border px-4 py-2">Delete</button>
      </div>
    </div>
  );
}
