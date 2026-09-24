import type { Meta, StoryObj } from '@storybook/vue3-vite'
import WithTooltip from './WithTooltip.vue'

const meta: Meta<typeof WithTooltip> = {
  title: 'Base/WithTooltip',
  component: WithTooltip,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: false
    }
  },
  render: args => ({
    components: { WithTooltip },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 4rem; min-height: 12rem; display: flex; justify-content: center; align-items: center;">
        <WithTooltip v-bind="args">
          <button type="button" class="btn btn-secondary">Hover me</button>
        </WithTooltip>
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'Simple tooltip content',
    placement: 'top'
  }
}
