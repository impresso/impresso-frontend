import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ProgressBar from './AudioProgressBar.vue'
import type { AudioProgressBarProps } from './AudioProgressBar.vue'
import { action } from 'storybook/actions'

const meta = {
  title: 'audioPlayer/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component that displays a progress bar for audio playback, showing the current time and total duration. It allows users to visualize the progress of the audio being played.',
      },
    },
  },
  tags: ['autodocs'],
  render: (args) => ({
    components: { ProgressBar },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 500px; height: 300px;">
        <ProgressBar v-bind="args">
        </ProgressBar>
      </div>
    `,
  }),
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    currentTime: 9,
    duration: 25,
    onTimeupdate: action('@timeupdate'),
  } as AudioProgressBarProps,
}

export const Disabled: Story = {
  args: {
    currentTime: 9,
    duration: 25,
    disabled: true,
    onTimeupdate: action('@timeupdate'),
  } as AudioProgressBarProps,
  parameters: {
    docs: {
      description: {
        story:
          'This progress bar is disabled and does not allow user interaction.',
      },
    },
  },
}
