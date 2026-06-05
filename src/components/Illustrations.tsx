/**
 * Decorative, brand-themed line illustrations (food & cooking).
 * Purely visual — marked aria-hidden. Stroke inherits currentColor.
 */

export function PlateIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="44" />
      <circle cx="60" cy="60" r="33" strokeDasharray="2 4" />
      <path d="M60 38c-9 0-16 7-16 16s7 16 16 16 16-7 16-16" />
      <path d="M52 54c2-3 5-5 8-5M64 64c-2 2-5 3-8 3" />
    </svg>
  );
}

export function WheatSprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M30 116V40" />
      {[40, 54, 68, 82].map((y) => (
        <g key={y}>
          <path d={`M30 ${y}c0-7 6-12 13-12 0 7-6 12-13 12z`} />
          <path d={`M30 ${y}c0-7-6-12-13-12 0 7 6 12 13 12z`} />
        </g>
      ))}
      <path d="M30 40c0-8 7-14 15-14 0 8-7 14-15 14zM30 40c0-8-7-14-15-14 0 8 7 14 15 14z" />
      <path d="M30 116c-6 0-11-4-13-10M30 116c6 0 11-4 13-10" />
    </svg>
  );
}

export function SteamingBowl({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 64h84a42 42 0 0 1-84 0z" />
      <path d="M14 64h92" />
      <path d="M48 30c-4 4-4 8 0 12M60 26c-4 4-4 8 0 12M72 30c-4 4-4 8 0 12" />
      <path d="M52 78l-6 14M60 80v14M68 78l6 14" />
    </svg>
  );
}

export function RollingPin({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="34" y="20" width="72" height="20" rx="10" />
      <path d="M34 30H10M106 30h24" />
      <path d="M10 26v8M130 26v8" />
    </svg>
  );
}

/** Empty-state placeholder shown when a product/banner has no image. */
export function FoodPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface to-brand-light/40 text-brand/30 ${className}`}
    >
      <SteamingBowl className="h-16 w-16" />
      <span className="font-display text-sm tracking-[0.3em] text-brand/25">
        TRADICIONALE
      </span>
    </div>
  );
}
