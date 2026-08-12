export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Video Editing PMIS
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Track editing tasks, due dates, and performance.
        </p>
        {children}
      </div>
    </div>
  );
}
