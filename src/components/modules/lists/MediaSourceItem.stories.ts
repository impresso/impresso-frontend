import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'
import { fn } from 'storybook/test'
import type { MediaSourceItemProps } from './MediaSourceItem.vue'
import MediaSourceItem from './MediaSourceItem.vue'
import { MockMediaSources } from '../../../../.storybook/mockData/mediaSources'
import { Routes } from '@/router/routes'

const baseArgs = {
  mediaSourceItem: {
    ...MockMediaSources[0],
    medium: 'print'
  },
  showTitle: true,
  showLink: true,
  showProvider: false,
  showType: true,
  showMedium: true
} satisfies MediaSourceItemProps & {
  showProvider?: boolean
  showType?: boolean
  showMedium?: boolean
}

const meta: Meta<typeof MediaSourceItem> = {
  title: 'Components/Modules/lists/MediaSourceItem',
  component: MediaSourceItem,
  tags: ['autodocs'],
  decorators: [
    vueRouter([
      {
        name: Routes.mediaSource.children.metadata.name,
        path: Routes.mediaSource.children.metadata.path,
        redirect: '/media-source/mock',
        beforeEnter: fn(() => false)
      }
    ])
  ],
  render: args => ({
    components: { MediaSourceItem },
    setup() {
      return { args }
    },
    template: '<MediaSourceItem v-bind="args" />'
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: baseArgs
}

export const WithoutLink: Story = {
  args: {
    ...baseArgs,
    showLink: false
  }
}

export const WithTypeAndMedium: Story = {
  args: {
    ...baseArgs,
    showType: true,
    showMedium: true
  }
}

export const WithProvider: Story = {
  args: {
    ...baseArgs,
    showProvider: true
  }
}
