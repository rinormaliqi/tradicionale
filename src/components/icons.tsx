/**
 * Lightweight inline SVG icons (stroke-based, inherit currentColor).
 * Kept in one file so the whole app shares one consistent, emoji-free set.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const CartIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h2.2l2.1 12.2a1.5 1.5 0 0 0 1.5 1.3h8.9a1.5 1.5 0 0 0 1.5-1.2L21 7H5.2" />
  </Base>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const TruckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h11v9H3z" />
    <path d="M14 9h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </Base>
);

export const MapPinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="2.6" />
  </Base>
);

export const LeafIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M11 20c-4 0-7-3-7-7C4 7 9 4 20 4c0 11-3 16-9 16z" />
    <path d="M9 16c2-4 5-7 9-9" />
  </Base>
);

export const WheatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 22V8" />
    <path d="M12 8c0-2 1.5-4 3.5-4C15.5 6 14 8 12 8zM12 8c0-2-1.5-4-3.5-4C8.5 6 10 8 12 8z" />
    <path d="M12 13c0-1.6 1.3-3 3-3 0 1.6-1.3 3-3 3zM12 13c0-1.6-1.3-3-3-3 0 1.6 1.3 3 3 3z" />
    <path d="M12 18c0-1.6 1.3-3 3-3 0 1.6-1.3 3-3 3zM12 18c0-1.6-1.3-3-3-3 0 1.6 1.3 3 3 3z" />
  </Base>
);

export const ChefHatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 14a4 4 0 0 1-1-7.9A4.5 4.5 0 0 1 14 5a4 4 0 0 1 4 8" />
    <path d="M6 14v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5" />
    <path d="M9 14v3M15 14v3" />
  </Base>
);

export const PrinterIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const MinusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
);

export const PencilIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Base>
);

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12l5 5L20 7" />
  </Base>
);

export const StarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" />
  </Base>
);

export const ImageIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M21 16l-5-5L5 21" />
  </Base>
);

export const UploadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 16V4m0 0L7 9m5-5l5 5" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Base>
);

export const XIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const ExternalIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </Base>
);
