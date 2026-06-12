/**
 * Format time in HH:MM:SS format
 * @param time Time in seconds
 * @returns Formatted time string
 */
export const formatTime = (time: number | null | undefined): string => {
  if (isNaN(time) || time === 0) return '00:00:00'
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  return [hours, minutes, seconds].map(d => d.toString().padStart(2, '0')).join(':')
}
/**
 * Converts a 'hh:mm:ss' time string into total seconds.
 */
export const timeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number)

  // Destructure hours, minutes, and seconds
  const [hours, minutes, seconds] = parts

  // Guard clause for invalid formats
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid time format: ${timeStr}. Expected hh:mm:ss`)
  }

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Calculates the seek target in seconds from a start time and a duration offset.
 * Handles 24-hour midnight rollover.
 */
export const getSeekTimeInSeconds = (startTime: string, durationOffset: string): number => {
  const startSec = timeToSeconds(startTime)
  const durationSec = timeToSeconds(durationOffset)

  const totalSecondsInDay = 24 * 3600 // 86400 seconds

  // Sum and wrap around 24 hours using modulo
  return (startSec + durationSec) % totalSecondsInDay
}
