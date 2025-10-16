export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6">
        {children}
      </div>
    </div>
  );
}
