export function getPageIndexFromCenterX(
  centerX: number,
  pageWidthWorld: number,
  gap: number,
  margin: number,
  totalPages: number
): number {
  const relativeX = centerX - margin
  const pageFullWidth = pageWidthWorld + gap
  let index = Math.round(relativeX / pageFullWidth)
  index = Math.max(0, Math.min(totalPages - 1, index))
  return index
}
