import type { Meta, StoryObj } from '@storybook/vue3'
import TimePunchcardChart from '../TimePunchcardChart.vue'
import { ChartData } from '@/d3-modules/TimePunchcardChart'

const meta: Meta<typeof TimePunchcardChart> = {
  title: 'Components/Modules/Vis/TimePunchcardChart',
  component: TimePunchcardChart,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => {
    return {
      components: { TimePunchcardChart },
      setup() {
        return { args }
      },
      template: '<TimePunchcardChart v-bind="args" />'
    }
  },
  decorators: []
} satisfies Meta<typeof TimePunchcardChart>

export default meta
type Story = StoryObj<typeof meta>

const testData: ChartData = {
  categories: Array.from({ length: 3 }, (_, i) => ({
    label: `Label ${i}`,
    dataPoints: Array.from({ length: 7 }, (_, j) => ({
      time: new Date(2021, i, 1, j, 0, 0),
      value: Math.random() * 100
    }))
  }))
}

export const Default: Story = {
  args: {
    data: testData
  }
}
