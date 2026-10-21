import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaristaIconButton from './BaristaIconButton.vue'
import type { BaristaIconButtonProps } from './BaristaIconButton.vue'

/**
 * Square icon-only button used in the Barista window headers.
 */
const meta: Meta<typeof BaristaIconButton> = {
  title: 'Barista/BaristaIconButton',
  component: BaristaIconButton,
  tags: ['autodocs'],
  render: args => ({
    components: { BaristaIconButton },
    setup() {
      return { args }
    },
    template: `<BaristaIconButton v-bind="args" />`
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const FloatingWindow: Story = {
  args: { icon: 'floatingWindow', label: 'Float over search results' } as BaristaIconButtonProps
}

export const Expand: Story = {
  args: { icon: 'expand', label: 'Open full view' } as BaristaIconButtonProps
}

export const Disabled: Story = {
  args: { icon: 'edit', label: 'New chat', disabled: true } as BaristaIconButtonProps
}
