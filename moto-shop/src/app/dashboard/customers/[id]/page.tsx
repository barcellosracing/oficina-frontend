"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function EditCustomerPage() {
  const supabase = createSupabaseBrowserClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("customers").select("*").eq("id", id).single();
      if (data) {
        setForm({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          vehicle_make: data.vehicle_make || "",
          vehicle_model: data.vehicle_model || "",
          vehicle_year: data.vehicle_year || "",
          notes: data.notes || "",
        });
      }
      setLoading(false);
    })();
  }, [id, supabase]);

  const onSave = async () => {
    setError(null);
    const { error } = await supabase.from("customers").update(form).eq("id", id);
    if (error) { setError(error.message); return; }
    router.push("/dashboard/customers");
  };

  const onDelete = async () => {
    if (!confirm("Delete this customer?") ) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    router.push("/dashboard/customers");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">Edit customer</h2>
      <div className="grid gap-3">
        <label className="text-sm">Full name<input className="w-full rounded-lg border px-3 py-2" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Email<input className="w-full rounded-lg border px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="text-sm">Phone<input className="w-full rounded-lg border px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-sm">Make<input className="w-full rounded-lg border px-3 py-2" value={form.vehicle_make} onChange={(e) => setForm({ ...form, vehicle_make: e.target.value })} /></label>
          <label className="text-sm">Model<input className="w-full rounded-lg border px-3 py-2" value={form.vehicle_model} onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })} /></label>
          <label className="text-sm">Year<input className="w-full rounded-lg border px-3 py-2" value={form.vehicle_year} onChange={(e) => setForm({ ...form, vehicle_year: e.target.value })} /></label>
        </div>
        <label className="text-sm">Notes<textarea rows={4} className="w-full rounded-lg border px-3 py-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onSave} className="rounded-lg bg-black text-white px-4 py-2">Save</button>
        <button onClick={onDelete} className="rounded-lg border px-4 py-2">Delete</button>
      </div>
    </div>
  );
}
