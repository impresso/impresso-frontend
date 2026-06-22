<template>
  <div class="TranscriptViewer">
    <slot name="header"></slot>
    <p
      :class="['transcript-paragraph', { active: i === activeUtteranceIndex }]"
      v-for="(utterance, i) in computedUtterances"
      :key="i"
    >
      <template v-for="(idx, j) in utterance.indices" :key="j">
        <span
          v-if="resolvedWords[idx]"
          :class="{
            'transcript-word': true,
            'active': idx === activeWordIndex,
            'in-frame': idx >= activeFrameRange.start && idx <= activeFrameRange.end,
            'in-segment': i === activeUtteranceIndex
          }"
          @click="onTranscriptWordClick(resolvedWords[idx])"
        >
          <span v-if="debug" class="text-muted small ms-1 ml-1">{{
            resolvedWords[idx].startTime
          }}</span>
          {{ resolvedWords[idx].text }}{{ ' ' }}
          <span v-if="debug" class="text-muted small me-1 mr-1">{{
            resolvedWords[idx].endTime
          }}</span>
        </span>
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ContentItemAudioLocator } from '@/models/generated/canonical/contentItem'
import { computed } from 'vue'

export interface Utterance {
  startTime: number
  endTime: number
  indices: number[]
}

export interface TranscriptWord {
  idx: number
  text: string
  startTime: number
  endTime: number
  locator?: ContentItemAudioLocator
}

export interface TranscriptViewerProps {
  utterances?: Utterance[]
  disabled?: boolean
  words?: TranscriptWord[]
  rrrebs?: TranscriptWord[]
  currentTime: number
  debug?: boolean
}

const props = defineProps<TranscriptViewerProps>()

const emit = defineEmits<{
  (e: 'click', word: TranscriptWord): void
}>()

const resolvedWords = computed(() => props.words ?? props.rrrebs ?? [])

const computedUtterances = computed<Utterance[]>(() => {
  if (props.utterances && props.utterances.length > 0) {
    return props.utterances
  }

  return resolvedWords.value.map((word, index) => ({
    startTime: word.startTime,
    endTime: word.endTime,
    indices: [index]
  }))
})

// Mappings for efficient lookup
const wordIndexToUtteranceIndex = computed<number[]>(() => {
  const map: number[] = []
  const utterances = computedUtterances.value
  for (let uIdx = 0; uIdx < utterances.length; uIdx++) {
    const indices = utterances[uIdx].indices
    for (let i = 0; i < indices.length; i++) {
      map[indices[i]] = uIdx
    }
  }
  return map
})

// Binary search to find the closest word to the current time (anchor for frame/paragraph)
const referenceWordIndex = computed<number>(() => {
  const words = resolvedWords.value
  if (words.length === 0) return -1

  const time = props.currentTime
  let low = 0
  let high = words.length - 1

  while (low <= high) {
    const mid = (low + high) >> 1
    const word = words[mid]
    if (time >= word.startTime && time < word.endTime) {
      return mid
    } else if (time < word.startTime) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  // Handle gaps: find whether low-1 or low is closer to currentTime
  if (low === 0) return 0
  if (low >= words.length) return words.length - 1

  const prevWord = words[low - 1]
  const nextWord = words[low]

  const prevDiff = Math.abs(time - prevWord.endTime)
  const nextDiff = Math.abs(nextWord.startTime - time)

  return prevDiff < nextDiff ? low - 1 : low
})

// Active word index (only if currentTime is exactly within the word's bounds)
const activeWordIndex = computed<number>(() => {
  const refIdx = referenceWordIndex.value
  if (refIdx === -1) return -1
  const word = resolvedWords.value[refIdx]
  const time = props.currentTime
  if (time >= word.startTime && time < word.endTime) {
    return refIdx
  }
  return -1
})

// Active utterance (paragraph) index
const activeUtteranceIndex = computed<number>(() => {
  const refIdx = referenceWordIndex.value
  if (refIdx === -1) return -1
  return wordIndexToUtteranceIndex.value[refIdx] ?? -1
})

// Active frame range spanning 2 seconds around currentTime (limit: [currentTime - 1s, currentTime + 1s]),
// limited by punctuation and paragraph boundary.
const activeFrameRange = computed<{ start: number; end: number }>(() => {
  const words = resolvedWords.value
  const refIdx = referenceWordIndex.value
  if (refIdx === -1 || words.length === 0) {
    return { start: -1, end: -1 }
  }

  const time = props.currentTime
  const uIdx = activeUtteranceIndex.value
  
  const hasPunctuation = (text: string): boolean => {
    if (!text) return false
    const trimmed = text.trim()
    if (trimmed.length === 0) return false
    const lastChar = trimmed[trimmed.length - 1]
    return /[.,;:!?]/.test(lastChar)
  }

  let start = refIdx
  let end = refIdx

  // Traverse backwards from reference word
  let i = refIdx - 1
  while (i >= 0) {
    const word = words[i]
    if (word.endTime <= time - 1.0) {
      break
    }
    if (wordIndexToUtteranceIndex.value[i] !== uIdx) {
      break
    }
    if (hasPunctuation(word.text)) {
      break
    }
    start = i
    i--
  }

  // Traverse forwards from reference word (if it doesn't end with punctuation itself)
  if (!hasPunctuation(words[refIdx].text)) {
    let j = refIdx + 1
    while (j < words.length) {
      const word = words[j]
      if (word.startTime >= time + 1.0) {
        break
      }
      if (wordIndexToUtteranceIndex.value[j] !== uIdx) {
        break
      }
      end = j
      if (hasPunctuation(word.text)) {
        break
      }
      j++
    }
  }

  return { start, end }
})

const onTranscriptWordClick = (word: TranscriptWord) => {
  if (!props.disabled) emit('click', word)
}
</script>

<style>
.TranscriptViewer .transcript-word {
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
  border-radius: 4px;
  padding: 0 2px;
  margin: 0 -2px;
}
.TranscriptViewer .transcript-word.active {
  background-color: #d1e7dd;
  font-variation-settings: var(--impresso-wght-bold, 600);
}
.TranscriptViewer .transcript-word.in-frame {
  background-color: rgba(209, 231, 221, 0.45);
}
.TranscriptViewer .transcript-word:hover {
  background-color: #ddd;
}
.TranscriptViewer .transcript-word.active:hover {
  background-color: #d1e7dd;
}
.TranscriptViewer .transcript-word.in-frame:hover {
  background-color: rgba(209, 231, 221, 0.6);
}
.transcript-paragraph {
  margin-bottom: 1rem;
  line-height: 1.6;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}
.TranscriptViewer .transcript-paragraph.active {
  opacity: 1;
}
</style>
