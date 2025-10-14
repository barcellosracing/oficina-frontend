import { createSupabaseServerClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export default async function DashboardHome() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}</h1>
        <p className="text-sm text-zinc-500">Today is {format(new Date(), "EEEE, MMM d")}.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
          <div className="text-sm text-zinc-500">Total Revenue</div>
          <div className="text-2xl font-semibold">$0.00</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
          <div className="text-sm text-zinc-500">Products in Stock</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
          <div className="text-sm text-zinc-500">Open Quotes</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
      </div>
    </div>
  );
}
