import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { RevenueChart, type RevenuePoint } from "@/components/RevenueChart";
export const dynamic = "force-dynamic";

async function getData() {
  const supabase = createSupabaseServerClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("total_cents, created_at")
    .order("created_at", { ascending: true });

  const months: RevenuePoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const mStart = startOfMonth(addMonths(now, -i));
    const mEnd = endOfMonth(addMonths(now, -i));
    const label = format(mStart, "MMM yyyy");
    const revenue = (orders || [])
      .filter((o) => new Date(o.created_at) >= mStart && new Date(o.created_at) <= mEnd)
      .reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;
    months.push({ label, revenue });
  }

  const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;

  return { months, totalRevenue };
}

export default async function ReportsPage() {
  const { months, totalRevenue } = await getData();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 bg-white dark:bg-zinc-900">
          <div className="text-sm text-zinc-500">Total Revenue</div>
          <div className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>
      <div className="rounded-xl border p-4 bg-white dark:bg-zinc-900">
        <div className="text-sm mb-4">Revenue last 6 months</div>
        <RevenueChart data={months} />
      </div>
    </div>
  );
}
