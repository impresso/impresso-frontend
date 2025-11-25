<template>
  <time :datetime="new Date(props.date).toISOString()">
    <span
      v-html="
        $tc(timeAgoData.key, timeAgoData.elapsedTime, {
          // For 'Yesterday' and 'Older' cases, format the date/time part
          date: timeAgoData.params.format
            ? $d(timeAgoData.params.date, timeAgoData.params.format)
            : '',

          // For 'Minutes' and 'Hours' cases, format the number
          n: $n(timeAgoData.elapsedTime)
        })
      "
    ></span>
  </time>
</template>
<i18n lang="json">
{
  "en": {
    "timeAgo": {
      "justNow": "just now",
      "minutes": "{n} minute ago | {n} minutes ago",
      "hours": "{n} hour ago | {n} hours ago",
      "yesterday": "yesterday at {date}",
      "twoDaysAgo": "two days ago at {date}",
      "fullDate": "{date}"
    }
  }
}
</i18n>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// --- 1. Constants and Interfaces ---

export interface TimeAgoProps {
  /** The date to display, expected to be an ISO string, timestamp, or Date object. */
  date: string | Date
}

interface TimeAgoData {
  key: string // The translation key (e.g., 'timeAgo.minutes')
  elapsedTime: number // The number used for $tc choice and $n formatting
  params: {
    date?: Date
    format?: 'shortTime' | 'long' // Format key for $d()
  }
}

const SECONDS_IN_MINUTE = 60
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR

// --- 2. Props Definition ---

const props = defineProps<TimeAgoProps>()

// --- 3. Dynamic Time State and Timer Management ---

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Update the `now` reference every 60 seconds
  timer = setInterval(() => {
    now.value = Date.now()
  }, 60000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// --- 4. Core Logic Function (Integrated) ---

/**
 * Calculates the time difference and determines the appropriate data structure for $tc().
 */
function getTimeAgoData(date: string | Date, currentTime: number): TimeAgoData {
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((currentTime - targetDate.getTime()) / 1000)

  // 1. Relative Time (less than a day)
  if (diffInSeconds < 10) {
    // Just Now
    return { key: 'timeAgo.justNow', elapsedTime: 1, params: {} }
  } else if (diffInSeconds < SECONDS_IN_HOUR) {
    // Minutes ago
    const minutes = Math.floor(diffInSeconds / SECONDS_IN_MINUTE)
    return { key: 'timeAgo.minutes', elapsedTime: minutes, params: {} }
  } else if (diffInSeconds < SECONDS_IN_DAY) {
    // Hours ago
    const hours = Math.floor(diffInSeconds / SECONDS_IN_HOUR)
    return { key: 'timeAgo.hours', elapsedTime: hours, params: {} }
  }

  // 2. Day-Specific Time (Yesterday, Two Days Ago, or Older)
  const startOfDayTarget = new Date(targetDate)
  startOfDayTarget.setHours(0, 0, 0, 0)

  const startOfDayNow = new Date(currentTime)
  startOfDayNow.setHours(0, 0, 0, 0)

  // Calculate difference in full days
  // Note: We divide by 1000 again here because SECONDS_IN_DAY is in seconds,
  // but the difference between getTime() is in milliseconds (so the 1000 is redundant in this calculation,
  // let's simplify to be milliseconds only)
  const diffInDays = Math.floor(
    (startOfDayNow.getTime() - startOfDayTarget.getTime()) / (SECONDS_IN_DAY * 1000)
  )

  if (diffInDays === 1) {
    // Yesterday
    return {
      key: 'timeAgo.yesterday',
      elapsedTime: 1,
      params: {
        date: targetDate,
        format: 'shortTime' // Time part (e.g., 11:44)
      }
    }
  } else if (diffInDays === 2) {
    // Two Days Ago
    return {
      key: 'timeAgo.twoDaysAgo',
      elapsedTime: 1,
      params: {
        date: targetDate,
        format: 'shortTime' // Time part (e.g., 11:44)
      }
    }
  } else {
    // Older than 2 days
    return {
      key: 'timeAgo.fullDate',
      elapsedTime: 1,
      params: {
        date: targetDate,
        format: 'long' // Full date format (e.g., November 22, 2025)
      }
    }
  }
}

// --- 5. Computed Final Output Data Structure ---

/**
 * Computes the data object required by the template's $tc call.
 */
const timeAgoData = computed<TimeAgoData>(() => {
  return getTimeAgoData(props.date, now.value)
})
</script>
