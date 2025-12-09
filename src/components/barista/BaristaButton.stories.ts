import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaristaButton from './BaristaButton.vue'

/**
 * BaristaButton is a floating button that opens a BaristaChat popup when clicked.
 * It is designed to be placed anywhere on the page and remains visible on top of other content.
 */
const meta = {
  title: 'Barista/BaristaButton',
  component: BaristaButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A floating button that opens the BaristaChat interface in a popup.'
      }
    }
  },
  argTypes: {}
} satisfies Meta<typeof BaristaButton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default implementation of the BaristaButton.
 * This component is designed to be placed anywhere in any page.
 */
export const Default: Story = {
  args: {}
}
