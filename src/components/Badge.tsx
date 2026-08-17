export function Badge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center border-l-4 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}
