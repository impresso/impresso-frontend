import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TopicWord from './TopicWord.vue'
import type { TopicWordProps } from './TopicWord.vue'
import TopicWordModel from '@/models/TopicWord'

const meta: Meta<typeof TopicWord> = {
  title: 'topics/TopicWord',
  component: TopicWord,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        TopicWord
      },
      template: `
        <div style="padding: 1rem; font-size: 1.1rem;">
          <TopicWord v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: new TopicWordModel({
      w: 'railway',
      p: 0.92,
      l: 0.9,
      h: false
    })
  } as TopicWordProps
}

export const Highlighted: Story = {
  args: {
    item: new TopicWordModel({
      w: 'station',
      p: 0.84,
      l: 1,
      h: true
    })
  } as TopicWordProps
}
