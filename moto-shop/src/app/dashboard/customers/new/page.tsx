"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  vehicle_make: z.string().optional().or(z.literal("")),
  vehicle_model: z.string().optional().or(z.literal("")),
  vehicle_year: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export default function NewCustomerPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("customers").insert({ owner: user?.id, ...values });
    if (error) { setError(error.message); return; }
    router.push("/dashboard/customers");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Add customer</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input className="w-full rounded-lg border px-3 py-2" {...register("full_name")} />
          {errors.full_name && <p className="text-sm text-red-600">{errors.full_name.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="w-full rounded-lg border px-3 py-2" {...register("email")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="w-full rounded-lg border px-3 py-2" {...register("phone")} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Make</label>
            <input className="w-full rounded-lg border px-3 py-2" {...register("vehicle_make")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input className="w-full rounded-lg border px-3 py-2" {...register("vehicle_model")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input className="w-full rounded-lg border px-3 py-2" {...register("vehicle_year")} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea rows={4} className="w-full rounded-lg border px-3 py-2" {...register("notes")} />
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
