import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Timeline from './Timeline.vue'
import type { TimelineProps } from './Timeline.vue'

const createTimelineValues = (startYear: number, endYear: number): NonNullable<TimelineProps['values']> =>
  Array.from({ length: endYear - startYear + 1 }, (_, index) => {
    const year = startYear + index
    const w = 20 + ((year - startYear) % 5) * 14
    const w1 = Math.max(5, w - 8)

    return {
      t: new Date(`${year}-01-01`),
      w,
      w1,
      p: Math.round((w / 90) * 100)
    }
  })

const meta: Meta<typeof Timeline> = {
  title: 'Components/Modules/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  render: args => ({
    components: { Timeline },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100%; max-width: 900px; padding: 1rem; border: 1px solid #d4d9de; border-radius: 8px; background: #fff;">
        <Timeline v-bind="args">
          <template #default="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              <strong>{{ tooltipScope.tooltip.item.w ?? 0 }}</strong> items
            </div>
          </template>
        </Timeline>
      </div>
    `
  }),
  parameters: {
    docs: {
      description: {
        component:
          'D3-powered timeline with brush, highlight and optional contrast rendering.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

const defaultValues = createTimelineValues(1900, 1910)

export const Default: Story = {
  args: {
    values: defaultValues,
    brush: [new Date('1902-01-01'), new Date('1906-01-01')],
    domain: ['1900', '1910'],
    exponent: 1,
    contrast: false,
    percentage: false,
    brushable: true,
    height: '150px',
    resolution: 'year',
    dataTestid: 'timeline-story-default'
  } as TimelineProps
}

export const Contrast: Story = {
  args: {
    ...Default.args,
    contrast: true,
    brushable: false,
    dataTestid: 'timeline-story-contrast'
  } as TimelineProps
}

export const Percentage: Story = {
  args: {
    ...Default.args,
    percentage: true,
    dataTestid: 'timeline-story-percentage'
  } as TimelineProps
}
