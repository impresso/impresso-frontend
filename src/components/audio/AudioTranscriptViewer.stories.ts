import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { action } from 'storybook/actions'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AudioTranscriptViewer from './AudioTranscriptViewer.vue'
import type { TranscriptViewerProps, TranscriptWord, Utterance } from './AudioTranscriptViewer.vue'

const mockWords: TranscriptWord[] = [
  {
    idx: 0,
    text: 'Good',
    startTime: 0,
    endTime: 1.2,
    locator: { timeCode: [0, 1.2], textLocation: [0, 4], utteranceIndex: 0 }
  },
  {
    idx: 1,
    text: 'morning',
    startTime: 1.2,
    endTime: 2.6,
    locator: { timeCode: [1.2, 1.4], textLocation: [5, 7], utteranceIndex: 0 }
  },
  {
    idx: 2,
    text: 'from',
    startTime: 3,
    endTime: 3.8,
    locator: { timeCode: [3, 0.8], textLocation: [13, 4], utteranceIndex: 1 }
  },
  {
    idx: 3,
    text: 'Impresso',
    startTime: 3.8,
    endTime: 5,
    locator: { timeCode: [3.8, 1.2], textLocation: [18, 8], utteranceIndex: 1 }
  }
]

const mockUtterances: Utterance[] = [
  {
    startTime: 0,
    endTime: 2.6,
    indices: [0, 1]
  },
  {
    startTime: 3,
    endTime: 5,
    indices: [2, 3]
  }
]

const mockWordsWithPunctuation: TranscriptWord[] = [
  // Paragraph 1: Hello from the Impresso team. We hope you are doing well today.
  { idx: 0, text: 'Hello', startTime: 0.0, endTime: 0.5 },
  { idx: 1, text: 'from', startTime: 0.5, endTime: 0.8 },
  { idx: 2, text: 'the', startTime: 0.8, endTime: 1.0 },
  { idx: 3, text: 'Impresso', startTime: 1.0, endTime: 1.6 },
  { idx: 4, text: 'team.', startTime: 1.6, endTime: 2.2 },
  { idx: 5, text: 'We', startTime: 2.4, endTime: 2.7 },
  { idx: 6, text: 'hope', startTime: 2.7, endTime: 3.1 },
  { idx: 7, text: 'you', startTime: 3.1, endTime: 3.3 },
  { idx: 8, text: 'are', startTime: 3.3, endTime: 3.5 },
  { idx: 9, text: 'doing', startTime: 3.5, endTime: 3.9 },
  { idx: 10, text: 'well', startTime: 3.9, endTime: 4.3 },
  { idx: 11, text: 'today.', startTime: 4.3, endTime: 5.0 },
  
  // Paragraph 2: This is a second paragraph, which shows how boundaries work.
  { idx: 12, text: 'This', startTime: 5.5, endTime: 5.9 },
  { idx: 13, text: 'is', startTime: 5.9, endTime: 6.1 },
  { idx: 14, text: 'a', startTime: 6.1, endTime: 6.3 },
  { idx: 15, text: 'second', startTime: 6.3, endTime: 6.8 },
  { idx: 16, text: 'paragraph,', startTime: 6.8, endTime: 7.5 },
  { idx: 17, text: 'which', startTime: 7.7, endTime: 8.1 },
  { idx: 18, text: 'shows', startTime: 8.1, endTime: 8.5 },
  { idx: 19, text: 'how', startTime: 8.5, endTime: 8.8 },
  { idx: 20, text: 'boundaries', startTime: 8.8, endTime: 9.5 },
  { idx: 21, text: 'work.', startTime: 9.5, endTime: 10.2 },
  
  // Paragraph 3: Let's see it in action!
  { idx: 22, text: "Let's", startTime: 10.8, endTime: 11.2 },
  { idx: 23, text: 'see', startTime: 11.2, endTime: 11.5 },
  { idx: 24, text: 'it', startTime: 11.5, endTime: 11.7 },
  { idx: 25, text: 'in', startTime: 11.7, endTime: 11.9 },
  { idx: 26, text: 'action!', startTime: 11.9, endTime: 12.5 }
]

const mockUtterancesWithPunctuation: Utterance[] = [
  {
    startTime: 0.0,
    endTime: 5.0,
    indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  {
    startTime: 5.5,
    endTime: 10.2,
    indices: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  },
  {
    startTime: 10.8,
    endTime: 12.5,
    indices: [22, 23, 24, 25, 26]
  }
]

const meta = {
  title: 'Components/audio/AudioTranscriptViewer',
  component: AudioTranscriptViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  render: args => ({
    components: { AudioTranscriptViewer },
    setup() {
      return { args }
    },
    template: `
      <div style="max-width: 900px; line-height: 1.75;">
        <AudioTranscriptViewer
          v-bind="args"
          @click="args.onClick"
        />
      </div>
    `
  }),
  argTypes: {
    onClick: {
      action: 'click',
      description: 'Emitted when clicking a transcript word'
    }
  }
} satisfies Meta<typeof AudioTranscriptViewer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    words: mockWords,
    utterances: mockUtterances,
    currentTime: 0,
    disabled: false,
    debug: false,
    onClick: action('@click')
  } as TranscriptViewerProps & { onClick: ReturnType<typeof action> }
}

export const WithActiveWord: Story = {
  args: {
    words: mockWords,
    utterances: mockUtterances,
    currentTime: 1.6,
    disabled: false,
    debug: false,
    onClick: action('@click')
  } as TranscriptViewerProps & { onClick: ReturnType<typeof action> }
}

export const AnimatedHighlight: Story = {
  render: args => ({
    components: { AudioTranscriptViewer },
    setup() {
      const currentTime = ref(0)
      let interval: any = null

      onMounted(() => {
        interval = setInterval(() => {
          currentTime.value = (currentTime.value + 0.1) % 13.0
        }, 100)
      })

      onUnmounted(() => {
        if (interval) clearInterval(interval)
      })

      const computedArgs = computed(() => ({
        ...args,
        currentTime: currentTime.value
      }))

      return { computedArgs, args }
    },
    template: `
      <div style="max-width: 900px; line-height: 1.75;">
        <div style="padding: 10px; margin-bottom: 20px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #0d6efd;">
          <strong>Auto-playing Transcript Demo</strong><br>
          <span style="font-family: monospace; font-size: 14px;">currentTime: {{ computedArgs.currentTime.toFixed(1) }}s</span>
        </div>
        <AudioTranscriptViewer
          v-bind="computedArgs"
          @click="args.onClick"
        />
      </div>
    `
  }),
  args: {
    words: mockWordsWithPunctuation,
    utterances: mockUtterancesWithPunctuation,
    disabled: false,
    debug: false,
    onClick: action('@click')
  } as any
}

export const Disabled: Story = {
  args: {
    words: mockWords,
    utterances: mockUtterances,
    currentTime: 3.2,
    disabled: true,
    debug: false,
    onClick: action('@click')
  } as TranscriptViewerProps & { onClick: ReturnType<typeof action> }
}

export const LegacyRrrebsProp: Story = {
  args: {
    rrrebs: mockWords,
    currentTime: 3.2,
    disabled: false,
    debug: true,
    onClick: action('@click')
  } as TranscriptViewerProps & { onClick: ReturnType<typeof action> }
}
