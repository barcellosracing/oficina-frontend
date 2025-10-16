import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-200/40 via-transparent to-transparent dark:from-orange-500/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">MotoShop</h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Manage products, services, quotes and revenue — built for motorcycle shops.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register" className="rounded-xl bg-black text-white px-5 py-3">Get started</Link>
            <Link href="/login" className="rounded-xl border px-5 py-3">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
