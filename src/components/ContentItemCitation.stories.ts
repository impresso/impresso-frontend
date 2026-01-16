import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemCitation from './ContentItemCitation.vue'
import type { ContentItemCitationProps } from './ContentItemCitation.vue'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'
import { getMediaSourceHandler } from '.storybook/mswHandlers'
import { MockDataProviders } from '.storybook/mockData/dataProviders'

const meta: Meta<typeof ContentItemCitation> = {
  title: 'components/ContentItemCitation',
  component: ContentItemCitation,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        // Inject the mock data into the global window object
        ;(window as any).impressoDataProviders = MockDataProviders
        return { args }
      },
      components: {
        ContentItemCitation
      },
      template: `
        <div style="height: 500px; width: 100%">
          <ContentItemCitation
              v-bind="args"
            />
        </div>
      `
    }
  },
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
  } as ContentItemCitationProps
}
