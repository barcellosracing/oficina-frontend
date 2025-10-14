import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type QuoteRow = {
  id: string;
  status: string;
  total_cents: number | null;
  customers?: { full_name?: string | null } | null;
};

export default async function QuotesPage() {
  const supabase = createSupabaseServerClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, status, total_cents, customers:customers!quotes_customer_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  const rows: QuoteRow[] = (quotes as unknown as QuoteRow[]) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quotes</h2>
        <Link href="/dashboard/quotes/new" className="rounded-lg bg-black text-white px-3 py-1.5">New quote</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Total</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-3">{q.customers?.full_name || "—"}</td>
                <td className="p-3">{q.status}</td>
                <td className="p-3 text-right">${((q.total_cents || 0) / 100).toFixed(2)}</td>
                <td className="p-3 text-right">
                  <Link href={`/dashboard/quotes/${q.id}`} className="underline">Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
