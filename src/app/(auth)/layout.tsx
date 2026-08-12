import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-white px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="brand-accent-strip" />
        <div className="p-8">
          <Image src="/logo.png" alt="PIO Bataan" width={220} height={83} priority className="mb-4" />
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Track editing tasks, due dates, and performance.
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
