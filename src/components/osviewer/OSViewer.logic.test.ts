import { describe, it, expect } from 'vitest' // or jest
import { getPageIndexFromCenterX } from './OSViewer.logic'

describe('getPageIndexFromCenterX', () => {
  const pageWidthWorld = 1
  const gap = 0.1
  const margin = 0.5
  const totalPages = 5

  it('should return index 0 when centered on first page', () => {
    const centerX = 0.5 // at margin
    expect(getPageIndexFromCenterX(centerX, pageWidthWorld, gap, margin, totalPages)).toBe(0)
  })

  it('should return index 1 when centered on second page', () => {
    const centerX = 1.6 // margin + (page + gap)
    expect(getPageIndexFromCenterX(centerX, pageWidthWorld, gap, margin, totalPages)).toBe(1)
  })

  it('should return index 4 when centered far to the right', () => {
    const centerX = 5.1
    expect(getPageIndexFromCenterX(centerX, pageWidthWorld, gap, margin, totalPages)).toBe(4)
  })

  it('should clamp below 0', () => {
    const centerX = -100
    expect(getPageIndexFromCenterX(centerX, pageWidthWorld, gap, margin, totalPages)).toBe(0)
  })

  it('should clamp above max', () => {
    const centerX = 999
    expect(getPageIndexFromCenterX(centerX, pageWidthWorld, gap, margin, totalPages)).toBe(4)
  })
})
