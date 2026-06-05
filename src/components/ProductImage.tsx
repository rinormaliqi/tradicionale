import { FoodPlaceholder } from "./Illustrations";
import type { ProductImage as ProductImageType } from "@/lib/types";

export function imageSrc(imageId: number, thumb = false): string {
  return `/api/images/${imageId}${thumb ? "?thumb=1" : ""}`;
}

export function primaryImageId(
  images: ProductImageType[] | undefined
): number | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.is_primary) ?? images[0];
  return primary.image_id;
}

export function ProductImage({
  images,
  alt,
  thumb = true,
  className = "",
}: {
  images: ProductImageType[] | undefined;
  alt: string;
  thumb?: boolean;
  className?: string;
}) {
  const id = primaryImageId(images);
  if (id == null) return <FoodPlaceholder className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc(id, thumb)}
      alt={alt}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
