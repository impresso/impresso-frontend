import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ShareContentItemModalButton from './ShareContentItemModalButton.vue'
import type { ShareContentItemModalButtonProps } from './ShareContentItemModalButton.vue'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'
import { getMediaSourceHandler } from '.storybook/mswHandlers'
import { MockDataProviders } from '.storybook/mockData/dataProviders'

const meta: Meta<typeof ShareContentItemModalButton> = {
  title: 'components/ShareContentItemModalButton',
  component: ShareContentItemModalButton,
  tags: ['autodocs'],
  render: args => ({
    setup() {
      ;(window as any).impressoDataProviders = MockDataProviders
      return { args }
    },
    components: { ShareContentItemModalButton },
    template: `<ShareContentItemModalButton v-bind="args" />`
  }),
  parameters: {
    msw: {
      handlers: [getMediaSourceHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: MockContentItemPublicDomain
  } as ShareContentItemModalButtonProps
}

export const NotPublicDomain: Story = {
  args: {
    item: {
      ...MockContentItemPublicDomain,
      access: { ...MockContentItemPublicDomain.access, copyright: 'in_cpy' }
    }
  } as ShareContentItemModalButtonProps
}
