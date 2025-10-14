import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">MotoShop</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard/products" className="hover:underline">Products</Link>
            <Link href="/dashboard/services" className="hover:underline">Services</Link>
            <Link href="/dashboard/customers" className="hover:underline">Customers</Link>
            <Link href="/dashboard/quotes" className="hover:underline">Quotes</Link>
            <Link href="/dashboard/reports" className="hover:underline">Reports</Link>
            <form action="/dashboard/signout" method="post">
              <button className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-zinc-500">Signed in as {user?.email}</footer>
    </div>
  );
}
