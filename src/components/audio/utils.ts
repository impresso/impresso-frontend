export interface RrrebPlainToken {
  s: number // start index in the transcript
  l: number // length of the token in the transcript
  tc: [number, number] // start time and duration
}

export interface RrrebToken {
  idx: number
  text: string
  startTime: number
  endTime: number
  start: number // start index in the transcript
  end: number // end index in the transcript
}

export interface PartialAudioContentItem {
  transcript: string
  ub_plain: number[]
  rrreb_plain: {
    id: string
    t: RrrebPlainToken[]
  }[]
}

export interface Utterance {
  breakPoint?: number // index in the transcript where the utterance ends
  startTime: number
  endTime: number
  indices: number[]
  start?: number // start index in the transcript
  end?: number // end index in the transcript
}

export const generateRrrebsFromTranscript = (
  item: PartialAudioContentItem,
  id: string
): RrrebToken[] => {
  const rrreb = item.rrreb_plain.find(d => d.id === id)
  if (!rrreb) {
    console.warn(`No rrreb_plain data found for id: ${id}`)
    return []
  }

  const grouped: RrrebToken[] = []
  let buffer: RrrebToken[] = []
  let tokenCount = 0
  let rrrebIdx = 0

  const tokens: RrrebToken[] = rrreb.t.map((token: RrrebPlainToken, i: number) => {
    const start = token.s
    const length = token.l
    const text = item.transcript.slice(start, start + length)
    const startTime = token.tc[0]
    const duration = token.tc[1]
    const endTime = startTime + duration
    return { text, startTime, endTime, start, end: start + length, idx: i }
  })

  const createGroupedToken = (buffer: RrrebToken[], idx: number): RrrebToken => {
    // Extract text directly from transcript using start/end indices
    const mergedStart = buffer[0].start
    const mergedEnd = buffer[buffer.length - 1].end
    const mergedText = item.transcript.slice(mergedStart, mergedEnd)

    const startTime = buffer[0].startTime
    const endTime = buffer[buffer.length - 1].endTime

    return {
      text: mergedText,
      startTime,
      endTime,
      idx,
      start: mergedStart,
      end: mergedEnd
    }
  }

  tokens.forEach((token, index) => {
    buffer.push(token)
    tokenCount++

    // Improved punctuation detection
    const endsWithPunctuation = /[.!?;:]$/.test(token.text.trim())
    const isMaxGroupSize = tokenCount >= 10
    const isLastToken = index === tokens.length - 1

    // More consistent grouping logic
    const shouldGroupNow =
      (endsWithPunctuation && tokenCount >= 2) || // At least 2 tokens for punctuation-based grouping
      isMaxGroupSize ||
      isLastToken

    if (shouldGroupNow) {
      grouped.push(createGroupedToken(buffer, rrrebIdx))
      rrrebIdx++
      buffer = []
      tokenCount = 0
    }
  })

  // Handle any remaining tokens in the buffer
  if (buffer.length > 0) {
    grouped.push(createGroupedToken(buffer, rrrebIdx))
  }

  return grouped
}

export const processPartialAudioContentItem = (
  item: PartialAudioContentItem,
  id: string
): { utterances: Utterance[]; rrrebs: RrrebToken[] } => {
  const rrrebTokens: RrrebToken[] = generateRrrebsFromTranscript(item, id)
  const utterances: Utterance[] = []

  let tokenIdx = 0
  for (let i = 0; i < item.ub_plain.length; i++) {
    const breakPoint = item.ub_plain[i]
    const tokenIndices: number[] = []

    while (tokenIdx < rrrebTokens.length && rrrebTokens[tokenIdx].start < breakPoint) {
      tokenIndices.push(tokenIdx)
      tokenIdx++
    }

    utterances.push({
      breakPoint,
      startTime: rrrebTokens[tokenIndices[0]].startTime,
      endTime: rrrebTokens[tokenIndices[tokenIndices.length - 1]].endTime,
      start: rrrebTokens[tokenIndices[0]].start,
      end: rrrebTokens[tokenIndices[tokenIndices.length - 1]].end,
      indices: tokenIndices
    })
  }
  // Handle any remaining tokens after the last breakpoint
  if (tokenIdx < rrrebTokens.length) {
    utterances.push({
      startTime: rrrebTokens[tokenIdx].startTime,
      endTime: rrrebTokens[rrrebTokens.length - 1].endTime,
      start: rrrebTokens[tokenIdx].start,
      end: rrrebTokens[rrrebTokens.length - 1].end,
      indices: rrrebTokens.slice(tokenIdx).map(t => t.idx)
    })
  }

  return {
    utterances,
    rrrebs: rrrebTokens
  }
}

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
