import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'
import TopicItem from './TopicItem.vue'
import type { TopicItemProps } from './TopicItem.vue'
import { Routes } from '@/router/routes'
import { MockLabeledTopic, MockWordsOnlyTopic, MockMinimalTopic } from '.storybook/mockData/topics'

const meta: Meta<typeof TopicItem> = {
  title: 'components/topics/TopicItem',
  component: TopicItem,
  tags: ['autodocs'],
  decorators: [vueRouter([{ ...Routes.topics.children.topic, component: { template: '<div />' } }])],
  render: (args: TopicItemProps) => ({
    components: { TopicItem },
    setup: () => ({ args }),
    template: '<div class="p-3"><TopicItem v-bind="args" /></div>'
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Labeled: Story = {
  args: { topic: MockLabeledTopic, showDescription: true, showId: true }
}

export const WordsOnly: Story = {
  args: { topic: MockWordsOnlyTopic }
}

export const MissingMetadata: Story = {
  args: { topic: MockMinimalTopic }
}

export const DetailHeader: Story = {
  args: { topic: MockLabeledTopic, showLink: false, showDescription: true }
}
