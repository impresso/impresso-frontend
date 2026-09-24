import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AudioTranscriptViewer from './AudioTranscriptViewer.vue'
import type { TranscriptWord, Utterance } from './AudioTranscriptViewer.vue'

const mockWords: TranscriptWord[] = [
  { idx: 0, text: 'Hello', startTime: 0, endTime: 1 },
  { idx: 1, text: 'world,', startTime: 1, endTime: 2 },
  { idx: 2, text: 'this', startTime: 2.1, endTime: 2.8 },
  { idx: 3, text: 'is', startTime: 2.8, endTime: 3.5 },
  { idx: 4, text: 'a', startTime: 3.5, endTime: 4 },
  { idx: 5, text: 'test.', startTime: 4, endTime: 5.5 }
]

const mockUtterances: Utterance[] = [
  { startTime: 0, endTime: 2, indices: [0, 1] },
  { startTime: 2.1, endTime: 5.5, indices: [2, 3, 4, 5] }
]

describe('AudioTranscriptViewer', () => {
  it('correctly determines the active word index based on currentTime', async () => {
    const wrapper = mount(AudioTranscriptViewer, {
      props: {
        words: mockWords,
        utterances: mockUtterances,
        currentTime: 0.5
      }
    })

    // Expose underlying computed/ref value through vm
    const vm = wrapper.vm as any
    expect(vm.activeWordIndex).toBe(0)

    // Move to next word
    await wrapper.setProps({ currentTime: 1.5 })
    expect(vm.activeWordIndex).toBe(1)

    // Move to gap
    await wrapper.setProps({ currentTime: 2.05 })
    expect(vm.activeWordIndex).toBe(-1)
  })

  it('correctly determines the closest reference word index in gaps', async () => {
    const wrapper = mount(AudioTranscriptViewer, {
      props: {
        words: mockWords,
        utterances: mockUtterances,
        currentTime: 2.02
      }
    })

    const vm = wrapper.vm as any
    // Close to word index 1 (ends at 2.0s)
    expect(vm.referenceWordIndex).toBe(1)

    await wrapper.setProps({ currentTime: 2.09 })
    // Close to word index 2 (starts at 2.1s)
    expect(vm.referenceWordIndex).toBe(2)
  })

  it('correctly resolves active utterance (paragraph) index', async () => {
    const wrapper = mount(AudioTranscriptViewer, {
      props: {
        words: mockWords,
        utterances: mockUtterances,
        currentTime: 0.5
      }
    })

    const vm = wrapper.vm as any
    expect(vm.activeUtteranceIndex).toBe(0)

    await wrapper.setProps({ currentTime: 3.0 })
    expect(vm.activeUtteranceIndex).toBe(1)
  })

  it('correctly computes the active frame range with time limits, paragraph limits, and punctuation limits', async () => {
    const wrapper = mount(AudioTranscriptViewer, {
      props: {
        words: mockWords,
        utterances: mockUtterances,
        currentTime: 3.0 // word: 'is' (idx 3, [2.8, 3.5])
      }
    })

    const vm = wrapper.vm as any
    // Time frame [2.0s, 4.0s].
    // Backwards: idx 2 is 'this' (starts 2.1, same paragraph). idx 1 is in prev paragraph -> STOP.
    // Forwards: idx 4 is 'a' (ends 4.0, same paragraph). idx 5 ends at 5.5 -> exceeds window -> STOP.
    // Frame should be indices 2 to 4.
    expect(vm.activeFrameRange).toEqual({ start: 2, end: 4 })

    // Move to index 1 ('world,' which has punctuation) at currentTime = 1.5s
    await wrapper.setProps({ currentTime: 1.5 })
    // Backwards: idx 0 is 'Hello' (starts 0.0) -> same paragraph, no punctuation -> included.
    // Forwards: idx 1 ends with punctuation -> forward loop shouldn't run.
    // Frame should be indices 0 to 1.
    expect(vm.activeFrameRange).toEqual({ start: 0, end: 1 })
  })
})
