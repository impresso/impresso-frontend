import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import BNavItemDropdown from '../BNavItemDropdown.vue'
import BDropdownItem from '../BDropdownItem.vue'

const meta: Meta = {
  title: 'Components/Legacy/Bootstrap/BNavItemDropdown',
  component: BNavItemDropdown,
  subcomponents: { BDropdownItem },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    onClick: fn()
  } as any,
  render: args => {
    return {
      components: { BNavItemDropdown, BDropdownItem },
      setup() {
        return { args }
      },
      template: `
        <b-nav-item-dropdown text="Dropdown" right>
          <b-dropdown-item v-bind="args">Item 1</b-dropdown-item>
        </b-nav-item-dropdown>
      `
    }
  }
} satisfies Meta<typeof BNavItemDropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
