/** Curated shots for shop products — dedicated board photography, not portfolio gallery picks. */
export const PRODUCT_IMAGE_OPTIONS = [
  "/images/board-maple.jpg",
  "/images/board-groove.jpg",
  "/images/board-drawer.jpg",
  "/images/board-counter.jpg",
  "/images/board-action.jpg",
  "/images/board-stove.jpg",
  "/images/board-mill.jpg",
  "/images/feature-drawer.jpg",
] as const;

export const DEFAULT_PRODUCT_IMAGES = {
  maple: [PRODUCT_IMAGE_OPTIONS[0], PRODUCT_IMAGE_OPTIONS[2]],
  default: [PRODUCT_IMAGE_OPTIONS[0], PRODUCT_IMAGE_OPTIONS[2]],
};

export function productImageLibrary(allImages: string[]) {
  const merged = new Set<string>([...PRODUCT_IMAGE_OPTIONS, ...allImages]);
  return [...merged].filter((url) => !url.includes("/images/portfolio/"));
}
