"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2),
  rate: z.coerce.number().min(0),
  description: z.string().optional().or(z.literal("")),
});

export default function NewServicePage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) as Resolver<z.infer<typeof schema>> });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("services")
      .insert({ owner: user?.id, name: values.name, description: values.description || null, rate_cents: Math.round(values.rate * 100) });
    if (error) { setError(error.message); return; }
    router.push("/dashboard/services");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Add service</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="w-full rounded-lg border px-3 py-2" {...register("name")} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Rate</label>
            <input type="number" step="0.01" className="w-full rounded-lg border px-3 py-2" {...register("rate")} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea rows={4} className="w-full rounded-lg border px-3 py-2" {...register("description")} />
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
