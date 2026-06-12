import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'

import ContentItemAudio from './AudioContentItem.vue/index.js'
import type { ContentItemAudioProps } from './AudioContentItem.vue/index.js'
import { MockContentItemAudio } from '.storybook/mockData/contentItems.js'

const meta = {
  title: 'Components/audio/ContentItemAudio',
  component: ContentItemAudio,
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
        name: 'ContentItemAudio',
        path: '/audio-content-item/:id',
        redirect: '/audio-content-item/mock',
        beforeEnter: () => true
      }
    ])
  ],
  tags: ['autodocs'],
  argTypes: {},
  render: args => ({
    components: { ContentItemAudio },
    setup() {
      return { args }
    },
    template: `
          <ContentItemAudio v-bind="args">
            
          </ContentItemAudio>
      `
  })
} satisfies Meta<typeof ContentItemAudio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    enablePlayer: true,
    item: MockContentItemAudio
  } as ContentItemAudioProps
}
