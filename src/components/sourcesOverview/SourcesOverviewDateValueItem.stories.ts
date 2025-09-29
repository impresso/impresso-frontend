import type { Meta, StoryObj } from '@storybook/vue3'
import SourcesOverviewDateValueItem from './SourcesOverviewDateValueItem.vue'

const meta: Meta<typeof SourcesOverviewDateValueItem> = {
  title: 'SourceOverview/DataValueItem',
  component: SourcesOverviewDateValueItem,
  render: args => ({
    components: { SourcesOverviewDateValueItem },
    setup() {
      return { args }
    },
    template:
      '<div style="height: 500px; border: 1px solid purple"><SourcesOverviewDateValueItem style="transform: translate(100px, 0);"v-bind="args" /></div>'
  })
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataValue: {
      id: '1',
      date: new Date('2020-01-01'),
      dateRange: [new Date('2020-01-01'), new Date('2020-12-31')],
      value: 100,
      label: 'Test Item',
      dataValues: [
        {
          id: '1.1',
          date: new Date('2020-01-01'),
          dateRange: [new Date('2020-01-01'), new Date('2020-06-30')],
          value: 60,
          label: 'Sub Item 1'
        },
        {
          id: '1.2',
          date: new Date('2020-07-01'),
          dateRange: [new Date('2020-07-01'), new Date('2020-12-31')],
          value: 40,
          label: 'Sub Item 2'
        }
      ]
    },
    height: 100,
    width: 200
  }
}
