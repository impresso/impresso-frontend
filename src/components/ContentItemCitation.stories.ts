import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemCitation from './ContentItemCitation.vue'
import type { ContentItemCitationProps } from './ContentItemCitation.vue'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'

import { useViewsStore } from '@/stores/views'
import { ViewShareContentItem } from '@/constants'

const meta: Meta<typeof ContentItemCitation> = {
  title: 'modals/ContentItemCitation',
  component: ContentItemCitation,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const viewStore = useViewsStore()
        viewStore.resetView()
        return { args, viewStore, ViewShareContentItem }
      },
      components: {
        ContentItemCitation
      },
      template: `
        <div style="height: 500px; width: 100%">
          <ContentItemCitation
              isVisible
              @dismiss="viewStore.resetView"
              v-bind="args"
            />
        </div>
      `
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
