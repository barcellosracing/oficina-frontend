"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function EditServicePage() {
  const supabase = createSupabaseBrowserClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", rate: "0", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("services").select("*").eq("id", id).single();
      if (data) {
        setForm({ name: data.name || "", rate: ((data.rate_cents || 0) / 100).toString(), description: data.description || "" });
      }
      setLoading(false);
    })();
  }, [id, supabase]);

  const onSave = async () => {
    setError(null);
    const { error } = await supabase
      .from("services")
      .update({ name: form.name, description: form.description || null, rate_cents: Math.round(Number(form.rate) * 100) })
      .eq("id", id);
    if (error) { setError(error.message); return; }
    router.push("/dashboard/services");
  };

  const onDelete = async () => {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    router.push("/dashboard/services");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">Edit service</h2>
      <div className="grid gap-3">
        <label className="text-sm">Name<input className="w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="text-sm">Rate<input type="number" step="0.01" className="w-full rounded-lg border px-3 py-2" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></label>
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
