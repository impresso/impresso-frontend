import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MediaSourceMetadata from './MediaSourceMetadata.vue'
import type { MediaSourceMetadataProps } from './MediaSourceMetadata.vue'
import { MockMediaSources } from '.storybook/mockData/mediaSources'

const meta: Meta<typeof MediaSourceMetadata> = {
  title: 'components/mediaSource/MediaSourceMetadata',
  component: MediaSourceMetadata,
  tags: ['autodocs'],
  render: args => ({
    components: { MediaSourceMetadata },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100%; max-width: 1200px;">
        <MediaSourceMetadata v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    mediaSource: MockMediaSources[0]
  } as MediaSourceMetadataProps
}
