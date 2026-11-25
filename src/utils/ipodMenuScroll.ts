export function clampIpodSelectionIndex(current: number, dir: 1 | -1, length: number): number {
  if (length <= 0) return 0;
  const clampedCurrent = Math.max(0, Math.min(length - 1, current));
  return Math.max(0, Math.min(length - 1, clampedCurrent + dir));
}

export interface SlidingScrollParams {
  currentScrollTop: number;
  containerHeight: number;
  itemTop: number;
  itemHeight: number;
  padding?: number;
}

export function computeSlidingScrollTop({
  currentScrollTop,
  containerHeight,
  itemTop,
  itemHeight,
  padding = 4,
}: SlidingScrollParams): number {
  if (containerHeight <= 0 || itemHeight <= 0) return Math.max(0, currentScrollTop);

  const visibleTop = currentScrollTop + padding;
  const visibleBottom = currentScrollTop + containerHeight - padding;
  const itemBottom = itemTop + itemHeight;

  if (itemTop < visibleTop) {
    return Math.max(0, itemTop - padding);
  }
  if (itemBottom > visibleBottom) {
    return Math.max(0, itemBottom - containerHeight + padding);
  }
  return Math.max(0, currentScrollTop);
}
