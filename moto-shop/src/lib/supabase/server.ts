import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseServerClient(): SupabaseClient {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const store = cookies() as unknown as { get: (n: string) => { value: string } | undefined };
            return store.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const store = cookies() as unknown as { set: (args: { name: string; value: string } & CookieOptions) => void };
            store.set({ name, value, ...options });
          } catch {
            // In RSC, cookies may be read-only; silent no-op
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const store = cookies() as unknown as { set: (args: { name: string; value: string } & CookieOptions) => void };
            store.set({ name, value: "", ...options });
          } catch {
            // In RSC, cookies may be read-only; silent no-op
          }
        },
      },
    }
  );
  return supabase as unknown as SupabaseClient;
}
