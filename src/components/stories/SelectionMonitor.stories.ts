import type { Filter } from '@/models';
import { vueRouter } from 'storybook-vue3-router';

import { type State, useSelectionMonitorStore } from '@/stores/selectionMonitor';
import type { Meta, StoryObj } from '@storybook/vue3';
import SelectionMonitor from '@/components/SelectionMonitor.vue';

interface SelectionMonitorProps extends Partial<State> {
  filters?: Filter[]
  startYear: number
  endYear: number
}

const a: Partial<State> = {
  isActive: true
}


const meta: Meta<SelectionMonitorProps> = {
  title: 'Components/SelectionMonitor',
  component: SelectionMonitor,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    startYear: 1800,
    endYear: 2000,
    ...({
      // store props
      isActive: true,
      applyCurrentSearchFilters: false,
      item: null,
      items: [],
      searchIndex: 'search',
      scope: 'overview',
      type: null,
      displayTimeline: true,
      displayActionButtons: true,
      debug: false,
      displayCurrentSearchFilters: false
    })
  },
  render: (args) => {
    const selectionMonitor = useSelectionMonitorStore()

    return {
      components: { SelectionMonitor },
      setup() {
        return { args }
      },
      watch: {
        args: {
          handler: function (value) {
            const { startYear, endYear, ...args } = value
            selectionMonitor.show(args)
          },
          deep: true,
          immediate: true
        }
      },
      template: '<SelectionMonitor :startYear="args.startYear" :endYear="args.endYear"/>'
    }
  },
  decorators: [vueRouter([{
    name: "entity",
    path: "/nothing",
    redirect: "/nothing"
  }])],
} satisfies Meta<typeof SelectionMonitor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'location',
    item: {
      uid: 'aida-0001-54-Cantons_of_Switzerland',
      name: 'Cantons of Switzerland',
      type: 'location',
      countMentions: -1,
      countItems: -1,
      wikidataId: '',
      dbpediaURL: '',
      impressoId: '',
      wikidata: [],
      relevance: 1
    },
    scope: 'overview',
    applyCurrentSearchFilters: false,
    displayTimeline: true,
    displayActionButtons: true,
    displayCurrentSearchFilters: false
  },
}
