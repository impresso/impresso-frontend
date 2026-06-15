import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { action } from 'storybook/actions'

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
