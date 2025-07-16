import { Rect } from 'openseadragon'

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

export function highlightCurrentPage(
  viewer: OpenSeadragon.Viewer | null,
  index: number,
  currentPageOverlay: HTMLDivElement | null,
  {
    gap = 0,
    pageWidthWorld = 1,
    aspectRatio = 1
  }: {
    gap?: number
    pageWidthWorld?: number
    aspectRatio?: number
  }
) {
  if (!viewer || !viewer.viewport) return

  const pageWidth = pageWidthWorld
  const pageHeight = pageWidth / aspectRatio

  const x = index * (pageWidth + gap)
  const y = 0

  // Remove the previous overlay if it exists
  if (currentPageOverlay) {
    viewer.removeOverlay(currentPageOverlay)
    currentPageOverlay = null
  }

  // Create the new overlay element
  const overlay = document.createElement('div')
  overlay.classList.add('page-highlight')

  overlay.style.boxSizing = 'border-box'
  overlay.style.width = '100%'
  overlay.style.height = '100%'

  // Store it so we can remove later
  currentPageOverlay = overlay

  const bounds = new Rect(x, y, pageWidth, pageHeight)
  viewer.addOverlay({
    element: overlay,
    location: bounds
  })
  return currentPageOverlay
}
