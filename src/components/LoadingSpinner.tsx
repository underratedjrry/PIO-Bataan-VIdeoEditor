export function LoadingSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#1565D8] dark:border-slate-700 dark:border-t-[#1565D8]" />
    </div>
  );
}
