import type { Meta, StoryObj } from '@storybook/vue3'
import SourcesOverviewTimeline, { TooltipPosition } from './SourcesOverviewTimeline.vue'
import { DataValue } from './SourcesOverviewDateValueItem.vue'
import SourceOverviewNavigator from './SourceOverviewNavigator.vue'
import { ref } from 'vue'

const MockDataValues: DataValue[] = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1).toString(),
  date: new Date(
    `18${Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0')}-01-01`
  ),
  dateRange: [
    new Date(
      `18${Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, '0')}-01-01`
    ),
    new Date(
      `18${Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, '0')}-12-31`
    )
  ],
  label: `Example ${i + 1}`,
  value: Math.floor(Math.random() * 100)
}))

const meta: Meta<typeof SourcesOverviewTimeline> = {
  title: 'SourceOverview/Timeline',
  component: SourcesOverviewTimeline,
  render: args => ({
    components: { SourcesOverviewTimeline },
    setup() {
      return { args }
    },
    template:
      '<SourcesOverviewTimeline v-bind="args" style="height: 500px; border: 1px solid purple" />'
  }),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A timeline component that displays a year-based timeline with configurable date ranges and minimum gap between ticks.'
      }
    }
  },
  argTypes: {
    startDate: {
      control: 'date',
      description: 'The starting date of the timeline'
    },
    endDate: {
      control: 'date',
      description: 'The ending date of the timeline'
    },
    minimumGap: {
      control: { type: 'number', min: 10, max: 100, step: 5 },
      description: 'Minimum distance in pixels between ticks'
    }
  },
  args: {
    startDate: new Date('1700-01-01'),
    endDate: new Date('2030-12-31'),
    minimumGap: 10
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: [
      {
        id: '1',
        date: new Date('1850-01-01'),
        dateRange: [new Date('1850-01-01'), new Date('1855-12-31')],
        label: 'Example from 1850',
        value: 100,
        dataValues: [
          {
            id: '1.1',
            date: new Date('1850-01-01'),
            dateRange: [new Date('1850-01-01'), new Date('1850-12-31')],
            label: 'Sub Example 2',
            value: 20
          },
          {
            id: '1.3',
            date: new Date('1851-01-01'),
            dateRange: [new Date('1851-01-01'), new Date('1852-12-31')],
            label: 'Sub Example 3',
            value: 15
          },
          {
            id: '1.4',
            date: new Date('1855-01-01'),
            dateRange: [new Date('1855-01-01'), new Date('1855-12-31')],
            label: 'Sub Example 4',
            value: 25
          }
        ]
      },
      {
        id: '2',
        date: new Date('1880-01-08'),
        dateRange: [new Date('1875-01-08'), new Date('1875-12-31')],
        label: 'Example from 1880',
        value: 100,
        dataValues: [
          {
            id: '2.1',
            date: new Date('1875-01-08'),
            dateRange: [new Date('1875-01-08'), new Date('1875-12-31')],
            label: 'Sub Example 1',
            value: 35
          }
        ]
      }
    ],
    minimumGap: 8
  }
}

export const ManyItems: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: MockDataValues,
    minimumGap: 10
  }
}

export const ManyItemsWithNavigator: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: MockDataValues,
    minimumGap: 50,
    fitToContainerWidth: false
  },
  render: args => ({
    components: { SourcesOverviewTimeline, SourceOverviewNavigator },
    setup() {
      const timelineRef = ref<InstanceType<typeof SourcesOverviewTimeline>>()
      const tooltipPosition = ref<TooltipPosition | null>(null)

      const handleTooltipMove = (pos: TooltipPosition) => {
        tooltipPosition.value = pos
      }

      const handleScrollUpdate = (updated: TooltipPosition) => {
        tooltipPosition.value = updated
        timelineRef.value?.scrollTo(updated.scrollLeft, updated.scrollTop)
      }

      return { args, timelineRef, tooltipPosition, handleTooltipMove, handleScrollUpdate }
    },

    template: `
      <div style="position: relative; overflow:scroll;">
        <SourcesOverviewTimeline 
          ref="timelineRef"
          v-bind="args" 
          style=" height: 500px; border: 1px solid purple" 
          @tooltip-move="handleTooltipMove"
        />
        <p>
        This timeline component has fixed gap between year ticks and it needs a navigator. Note that fitToContainerWidth is false to show horizontal padding and how to use the component SourceOverviewNavigator correctly.
        </p>
        <div class="position-absolute bottom-0 end-0 p-2">
          <SourceOverviewNavigator
            :initialX="270"
            :initialY="-500"
            :zIndex="1038"
            v-model:tooltipPosition="tooltipPosition"
            @update:tooltipPosition="handleScrollUpdate"
          >
            <footer class="m-2">
              <button
                class="btn btn-sm border border-dark btn-outline-secondary"
                
              >
                {{ $t('gettingStarted') }}
              </button>
            </footer>
          </SourceOverviewNavigator>
        </div>
      </div>
      `
  })
}
