import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = createSupabaseServerClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, full_name, email, phone, vehicle_make, vehicle_model")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customers</h2>
        <Link href="/dashboard/customers/new" className="rounded-lg bg-black text-white px-3 py-1.5">Add customer</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Vehicle</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((c) => (
              <tr key={c.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-3">{c.full_name}</td>
                <td className="p-3">{c.email || "—"} {c.phone ? ` / ${c.phone}` : ""}</td>
                <td className="p-3">{[c.vehicle_make, c.vehicle_model].filter(Boolean).join(" ") || "—"}</td>
                <td className="p-3">
                  <Link href={`/dashboard/customers/${c.id}`} className="underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
