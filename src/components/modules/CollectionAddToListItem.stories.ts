import type { Meta, StoryObj } from '@storybook/vue3'
import CollectionAddToListItem from './CollectionAddToListItem.vue'
import Collection from '@/models/Collection'

const meta: Meta<typeof CollectionAddToListItem> = {
  component: CollectionAddToListItem,
  title: 'Components/Modules/CollectionAddToListItem',
  tags: ['autodocs'],
  parameters: {}
}

export default meta
type Story = StoryObj<typeof meta>

const MockCollection: Collection = new Collection({
  uid: 'coll1',
  name: 'My Research Collection',
  description: 'A collection of my favorite research articles.',
  creationDate: new Date('2024-01-10T09:00:00'),
  lastModifiedDate: new Date('2024-06-15T10:30:00'),

  countItems: 0,
  countArticles: 0,
  countEntities: 0,
  countIssues: 0
})

export const Default: Story = {
  args: {
    collection: {
      ...MockCollection
    },
    isChecked: false
  }
}

export const checked: Story = {
  args: {
    collection: {
      ...MockCollection
    },
    isChecked: true,
    isLoading: false
  }
}
export const isLoading: Story = {
  args: {
    collection: {
      ...MockCollection
    },
    isChecked: true,
    isLoading: true
  }
}
