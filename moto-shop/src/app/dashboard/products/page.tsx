import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, sku, name, price_cents, stock")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link href="/dashboard/products/new" className="rounded-lg bg-black text-white px-3 py-1.5">Add product</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Name</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-3">{p.sku || "—"}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-right">${((p.price_cents || 0) / 100).toFixed(2)}</td>
                <td className="p-3 text-right">{p.stock}</td>
                <td className="p-3 text-right">
                  <Link href={`/dashboard/products/${p.id}`} className="underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
