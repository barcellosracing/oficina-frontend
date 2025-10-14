import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const supabase = createSupabaseServerClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, rate_cents")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Services</h2>
        <Link href="/dashboard/services/new" className="rounded-lg bg-black text-white px-3 py-1.5">Add service</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-right p-3">Rate</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services?.map((s) => (
              <tr key={s.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-3">{s.name}</td>
                <td className="p-3 text-right">${((s.rate_cents || 0) / 100).toFixed(2)}</td>
                <td className="p-3 text-right">
                  <Link href={`/dashboard/services/${s.id}`} className="underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
