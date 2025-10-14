"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const schema = z.object({
  sku: z.string().optional(),
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0),
  description: z.string().optional(),
});

export default function NewProductPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) as Resolver<z.infer<typeof schema>> });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("products")
      .insert({
        owner: user?.id,
        sku: values.sku || null,
        name: values.name,
        description: values.description || null,
        price_cents: Math.round(values.price * 100),
        cost_cents: values.cost != null ? Math.round(values.cost * 100) : null,
        stock: values.stock,
      });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard/products");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Add product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2" {...register("sku")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2" {...register("name")} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2" {...register("price")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost</label>
            <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2" {...register("cost")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input type="number" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2" {...register("stock")} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2" rows={4} {...register("description")} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button disabled={isSubmitting} className="rounded-lg bg-black text-white px-4 py-2">Save</button>
          <button type="button" onClick={() => history.back()} className="rounded-lg border px-4 py-2">Cancel</button>
        </div>
      </form>
    </div>
  );
}
