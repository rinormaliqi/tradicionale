export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="font-display text-2xl font-700 tracking-wide text-ink">
        TRADICIONALE
      </span>
      <span className="mt-0.5 text-[10px] font-500 uppercase tracking-[0.25em] text-muted">
        në mënyrë artizanale
      </span>
    </span>
  );
}
