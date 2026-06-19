import { defineStore } from 'pinia'

const MAX_READING_PROGRESS_ENTRIES = 100
const READING_PROGRESS_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

export interface AudioReadingProgressEntry {
  contentItemId: string
  currentTime: number
  updatedAt: number
}

export interface State {
  contentItemId: string | null
  isPlaying: boolean
  readingProgress: AudioReadingProgressEntry[]
}

export const useAudioStore = defineStore('audio', {
  state: (): State => ({
    contentItemId: null,
    isPlaying: false,
    readingProgress: []
  }),
  getters: {
    getReadingTimeByContentItemId: state => (contentItemId: string) => {
      const now = Date.now()
      const entry = state.readingProgress.find(item => item.contentItemId === contentItemId)
      if (!entry) {
        return 0
      }
      if (now - entry.updatedAt > READING_PROGRESS_TTL_MS) {
        return 0
      }
      return entry.currentTime
    }
  },
  actions: {
    pruneReadingProgress() {
      const now = Date.now()
      this.readingProgress = this.readingProgress
        .filter(item => now - item.updatedAt <= READING_PROGRESS_TTL_MS)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_READING_PROGRESS_ENTRIES)
    },
    setReadingTime(contentItemId: string, currentTime: number) {
      if (!contentItemId || !Number.isFinite(currentTime) || currentTime < 0) {
        return
      }

      this.pruneReadingProgress()

      const sanitizedCurrentTime = Math.max(0, currentTime)
      const updatedAt = Date.now()
      const withoutCurrentItem = this.readingProgress.filter(
        item => item.contentItemId !== contentItemId
      )

      this.readingProgress = [
        {
          contentItemId,
          currentTime: sanitizedCurrentTime,
          updatedAt
        },
        ...withoutCurrentItem
      ].slice(0, MAX_READING_PROGRESS_ENTRIES)
    },
    setContentItemId(contentItemId: string | null) {
      this.contentItemId = contentItemId
    },
    setIsPlaying(isPlaying: boolean) {
      this.isPlaying = isPlaying
    }
  },
  persist: {
    paths: ['readingProgress']
  }
})
