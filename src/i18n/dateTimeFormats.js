export default {
  en: {
    year: {
      year: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    },
    longUtc: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'UTC'
    },
    precise: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    },
    compact: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    },
    compactUtc: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    },
    short: {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    },
    month: {
      month: 'short',
      year: 'numeric'
    },
    day: {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    },
    // 1. You need the 'shortTime' key for the TimeAgo component
    shortTime: {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false // Use false for 24-hour format
    }
  }
}
