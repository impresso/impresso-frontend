import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterNumericRange from './FilterNumericRange.vue'
import type { FilterNumericRangeProps } from './FilterNumericRange.vue'

const meta: Meta<typeof FilterNumericRange> = {
  title: 'Components/Modules/FilterNumericRange',
  component: FilterNumericRange,
  tags: ['autodocs'],
  render: args => ({
    components: {
      FilterNumericRange
    },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 280px;">
        <FilterNumericRange v-bind="args" />
      </div>
    `
  }),
  argTypes: {
    onChanged: {
      action: 'changed',
      description: 'Emitted when the numeric range changes'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    start: 1900,
    end: 1950
  } as FilterNumericRangeProps
}
