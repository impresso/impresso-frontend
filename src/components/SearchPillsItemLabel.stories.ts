import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SearchPillsItemLabel from './SearchPillsItemLabel.vue'
import type { SearchPillsItemLabelProps } from './SearchPillsItemLabel.vue'

const meta: Meta<typeof SearchPillsItemLabel> = {
  title: 'Components/SearchPillsItemLabel',
  component: SearchPillsItemLabel,
  tags: ['autodocs'],
  render: args => ({
    components: { SearchPillsItemLabel },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 16px; text-align: start;">
        <SearchPillsItemLabel v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: {
      tokens: [
        { type: 'text', value: 'Lausanne' },
        { type: 'text', value: 'Geneva' }
      ],
      operatorKey: 'op.or',
      hiddenCount: 0,
      classNames: ['sp-labelled']
    },
    contextClass: 'include'
  } as SearchPillsItemLabelProps
}
