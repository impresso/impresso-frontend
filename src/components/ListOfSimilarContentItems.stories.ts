import { Meta, StoryObj } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { fn } from 'storybook/test'
import ListOfSimilarContentItems from './ListOfSimilarContentItems.vue'
import { MockContentItem } from './modules/lists/ContentItem.stories'

const meta: Meta<typeof ListOfSimilarContentItems> = {
  title: 'Components/ListOfSimilarContentItems',
  component: ListOfSimilarContentItems,
  decorators: [
    vueRouter([
      {
        name: 'issue-viewer',
        path: '/nothing/:issue_uid',
        redirect: '/nothing',
        beforeEnter: fn(() => false)
      }
    ])
  ],
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof ListOfSimilarContentItems>

export const Default: Story = {
  args: {
    contentItem: MockContentItem
  }
}
