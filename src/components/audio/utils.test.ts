import { describe, expect, it } from 'vitest'
import { formatTime, getSeekTimeInSeconds, timeToSeconds } from './utils'

describe('formatTime', () => {
  it('returns 00:00:00 for nullish, NaN, and zero values', () => {
    expect(formatTime(null)).toBe('00:00:00')
    expect(formatTime(undefined)).toBe('00:00:00')
    expect(formatTime(Number.NaN)).toBe('00:00:00')
    expect(formatTime(0)).toBe('00:00:00')
  })

  it('formats seconds to HH:MM:SS with zero padding', () => {
    expect(formatTime(1)).toBe('00:00:01')
    expect(formatTime(61)).toBe('00:01:01')
    expect(formatTime(3661)).toBe('01:01:01')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(59.9)).toBe('00:00:59')
    expect(formatTime(3600.8)).toBe('01:00:00')
  })
})

describe('timeToSeconds', () => {
  it('converts hh:mm:ss to total seconds', () => {
    expect(timeToSeconds('00:00:00')).toBe(0)
    expect(timeToSeconds('00:01:30')).toBe(90)
    expect(timeToSeconds('01:01:01')).toBe(3661)
  })

  it('throws on invalid formats', () => {
    expect(() => timeToSeconds('01:02')).toThrow('Invalid time format')
    expect(() => timeToSeconds('aa:bb:cc')).toThrow('Invalid time format')
    expect(() => timeToSeconds('01:xx:03')).toThrow('Invalid time format')
  })
})

describe('getSeekTimeInSeconds', () => {
  it('returns start + offset in seconds', () => {
    expect(getSeekTimeInSeconds('00:00:30', '00:01:00')).toBe(90)
    expect(getSeekTimeInSeconds('01:00:00', '00:30:00')).toBe(5400)
  })

  it('handles midnight rollover with modulo 24h', () => {
    expect(getSeekTimeInSeconds('23:59:50', '00:00:15')).toBe(5)
    expect(getSeekTimeInSeconds('23:00:00', '02:00:00')).toBe(3600)
  })
})
