import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'

import AudioContentItem from './AudioContentItem.vue'
import type { AudioContentItemProps } from './AudioContentItem.vue'
import { MockAudioContentItem } from '.storybook/mockData/contentItems'

const meta = {
  title: 'Components/audio/AudioContentItem',
  component: AudioContentItem,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A component that displays a progress bar for audio playback, showing the current time and total duration. It allows users to visualize the progress of the audio being played.'
      }
    }
  },
  decorators: [
    vueRouter([
      {
        name: 'audioContentItem',
        path: '/audio-content-item/:content_item_id',
        redirect: '/audio-content-item/mock',
        beforeEnter: () => true
      }
    ])
  ],
  tags: ['autodocs'],
  argTypes: {},
  render: args => ({
    components: { AudioContentItem },
    setup() {
      return { args }
    },
    template: `
          <AudioContentItem v-bind="args">
            
          </AudioContentItem>
      `
  })
} satisfies Meta<typeof AudioContentItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    enablePlayer: true,
    contentItem: MockAudioContentItem
  } as AudioContentItemProps
}
