import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { action } from 'storybook/actions'
import FilterMonitor from './FilterMonitor.vue'
import type {
  FilterMonitorFilter,
  FilterMonitorItem,
  FilterMonitorProps
} from './FilterMonitor.vue'

const cloneFilter = (filter: FilterMonitorFilter): FilterMonitorFilter => ({
  ...filter,
  q: Array.isArray(filter.q) ? [...filter.q] : filter.q,
  items: filter.items ? filter.items.map(item => ({ ...item })) : []
})

const baseEntityItems: FilterMonitorItem[] = [
  { id: 'person-1', uid: 'person-1', name: 'Ada Lovelace', count: 21 },
  { id: 'person-2', uid: 'person-2', name: 'Alan Turing', count: 15 }
]

const baseEntityFilter: FilterMonitorFilter = {
  type: 'person',
  op: 'OR',
  context: 'include',
  q: ['person-1', 'person-2'],
  items: baseEntityItems
}

const baseStringFilter: FilterMonitorFilter = {
  type: 'string',
  op: 'OR',
  context: 'include',
  q: ['railway', 'industry'],
  items: [{ id: 'railway' }, { id: 'industry' }]
}

const baseDateRangeFilter: FilterMonitorFilter = {
  type: 'daterange',
  op: 'AND',
  context: 'include',
  q: ['1901-01-01', '1907-12-31'],
  items: [{ id: 'daterange-1', start: '1901-01-01', end: '1907-12-31' }]
}

const baseNumericRangeFilter: FilterMonitorFilter = {
  type: 'contentLength',
  op: 'AND',
  context: 'include',
  q: ['100', '400'],
  items: [{ id: 'contentLength-1', start: '100', end: '400' }]
}

const baseEmbeddingFilter: FilterMonitorFilter = {
  type: 'embedding',
  op: 'OR',
  context: 'include',
  q: ['industrial revolution'],
  items: [{ id: 'Embedding vector: industrial revolution context sentence...' }]
}

const meta: Meta<typeof FilterMonitor> = {
  title: 'Components/Modules/FilterMonitor',
  component: FilterMonitor,
  tags: ['autodocs'],
  render: args => ({
    components: { FilterMonitor },
    setup() {
      const changedAction = action('changed')
      const removedAction = action('removed')
      const daterangeChangedAction = action('daterange-changed')
      const filter = ref<FilterMonitorFilter>(cloneFilter(args.filter))
      const itemsToAdd = ref<FilterMonitorItem[]>([...(args.itemsToAdd ?? [])])
      const events = ref<string[]>([])

      const handleChanged = (nextFilter: FilterMonitorFilter) => {
        changedAction(nextFilter)
        filter.value = cloneFilter(nextFilter)
        events.value = [`changed (${nextFilter.type})`, ...events.value].slice(0, 5)
      }

      const handleRemoved = (nextFilter: FilterMonitorFilter) => {
        removedAction(nextFilter)
        events.value = ['removed', ...events.value].slice(0, 5)
      }

      const handleDaterangeChanged = (nextFilter: FilterMonitorFilter) => {
        daterangeChangedAction(nextFilter)
        events.value = ['daterange-changed', ...events.value].slice(0, 5)
      }

      return {
        args,
        filter,
        itemsToAdd,
        events,
        handleChanged,
        handleRemoved,
        handleDaterangeChanged
      }
    },
    template: `
      <div style="max-width: 420px; padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px; background: #fff;">
        <FilterMonitor
          :operators="args.operators"
          :contexts="args.contexts"
          :precisions="args.precisions"
          :checkbox="args.checkbox"
          :filter="filter"
          :itemsToAdd="itemsToAdd"
          :minDate="args.minDate"
          :maxDate="args.maxDate"
          @changed="handleChanged"
          @removed="handleRemoved"
          @daterange-changed="handleDaterangeChanged"
        />
        <div style="margin-top: 1rem; font-size: 12px; color: #5b6670;">
          <strong>Events:</strong>
          <div v-if="events.length === 0">No events yet</div>
          <div v-for="(eventName, idx) in events" :key="idx">{{ eventName }}</div>
        </div>
      </div>
    `
  }),
  args: {
    operators: ['OR', 'AND'],
    contexts: ['include', 'exclude'],
    precisions: ['fuzzy', 'exact', 'soft'],
    checkbox: false,
    filter: baseEntityFilter,
    itemsToAdd: [],
    minDate: new Date('1890-01-01'),
    maxDate: new Date('1930-12-31')
  } as FilterMonitorProps
}

export default meta
type Story = StoryObj<typeof meta>

export const EntityDefault: Story = {}

export const EntityCheckboxMode: Story = {
  args: {
    ...meta.args,
    checkbox: true,
    filter: baseEntityFilter
  } as FilterMonitorProps
}

export const StringFilter: Story = {
  args: {
    ...meta.args,
    checkbox: false,
    filter: baseStringFilter
  } as FilterMonitorProps
}

export const DateRangeFilter: Story = {
  args: {
    ...meta.args,
    checkbox: false,
    filter: baseDateRangeFilter
  } as FilterMonitorProps
}

export const NumericRangeFilter: Story = {
  args: {
    ...meta.args,
    checkbox: false,
    filter: baseNumericRangeFilter
  } as FilterMonitorProps
}

export const EmbeddingFilter: Story = {
  args: {
    ...meta.args,
    checkbox: false,
    filter: baseEmbeddingFilter
  } as FilterMonitorProps
}

export const AllVariants: Story = {
  render: () => ({
    components: { FilterMonitor },
    setup() {
      const changedEntityAction = action('changed:entity')
      const removedEntityAction = action('removed:entity')
      const daterangeChangedEntityAction = action('daterange-changed:entity')
      const changedEntityCheckboxAction = action('changed:entity-checkbox')
      const removedEntityCheckboxAction = action('removed:entity-checkbox')
      const daterangeChangedEntityCheckboxAction = action('daterange-changed:entity-checkbox')
      const changedStringAction = action('changed:string')
      const removedStringAction = action('removed:string')
      const daterangeChangedStringAction = action('daterange-changed:string')
      const changedDateRangeAction = action('changed:daterange')
      const removedDateRangeAction = action('removed:daterange')
      const daterangeChangedDateRangeAction = action('daterange-changed:daterange')
      const changedNumericRangeAction = action('changed:numeric-range')
      const removedNumericRangeAction = action('removed:numeric-range')
      const daterangeChangedNumericRangeAction = action('daterange-changed:numeric-range')
      const changedEmbeddingAction = action('changed:embedding')
      const removedEmbeddingAction = action('removed:embedding')
      const daterangeChangedEmbeddingAction = action('daterange-changed:embedding')
      const minDate = new Date('1890-01-01')
      const maxDate = new Date('1930-12-31')
      const itemsToAdd = [{ id: 'person-3', uid: 'person-3', name: 'Grace Hopper', count: 7 }]

      return {
        minDate,
        maxDate,
        itemsToAdd,
        entity: cloneFilter(baseEntityFilter),
        entityCheckbox: cloneFilter(baseEntityFilter),
        stringFilter: cloneFilter(baseStringFilter),
        dateRange: cloneFilter(baseDateRangeFilter),
        numericRange: cloneFilter(baseNumericRangeFilter),
        embedding: cloneFilter(baseEmbeddingFilter),
        changedEntityAction,
        removedEntityAction,
        daterangeChangedEntityAction,
        changedEntityCheckboxAction,
        removedEntityCheckboxAction,
        daterangeChangedEntityCheckboxAction,
        changedStringAction,
        removedStringAction,
        daterangeChangedStringAction,
        changedDateRangeAction,
        removedDateRangeAction,
        daterangeChangedDateRangeAction,
        changedNumericRangeAction,
        removedNumericRangeAction,
        daterangeChangedNumericRangeAction,
        changedEmbeddingAction,
        removedEmbeddingAction,
        daterangeChangedEmbeddingAction
      }
    },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1rem;">
        <div style="padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px;">
          <h4>Entity</h4>
          <FilterMonitor
            :filter="entity"
            :itemsToAdd="itemsToAdd"
            :minDate="minDate"
            :maxDate="maxDate"
            @changed="changedEntityAction"
            @removed="removedEntityAction"
            @daterange-changed="daterangeChangedEntityAction"
          />
        </div>
        <div style="padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px;">
          <h4>Entity (checkbox mode)</h4>
          <FilterMonitor
            :filter="entityCheckbox"
            :checkbox="true"
            :minDate="minDate"
            :maxDate="maxDate"
            @changed="changedEntityCheckboxAction"
            @removed="removedEntityCheckboxAction"
            @daterange-changed="daterangeChangedEntityCheckboxAction"
          />
        </div>
        <div style="padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px;">
          <h4>String</h4>
          <FilterMonitor
            :filter="stringFilter"
            :minDate="minDate"
            :maxDate="maxDate"
            @changed="changedStringAction"
            @removed="removedStringAction"
            @daterange-changed="daterangeChangedStringAction"
          />
        </div>
        <div style="padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px;">
          <h4>Date Range</h4>
          <FilterMonitor
            :filter="dateRange"
            :minDate="minDate"
            :maxDate="maxDate"
            @changed="changedDateRangeAction"
            @removed="removedDateRangeAction"
            @daterange-changed="daterangeChangedDateRangeAction"
          />
        </div>
        <div style="padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px;">
          <h4>Numeric Range</h4>
          <FilterMonitor
            :filter="numericRange"
            :minDate="minDate"
            :maxDate="maxDate"
            @changed="changedNumericRangeAction"
            @removed="removedNumericRangeAction"
            @daterange-changed="daterangeChangedNumericRangeAction"
          />
        </div>
        <div style="padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px;">
          <h4>Embedding</h4>
          <FilterMonitor
            :filter="embedding"
            :minDate="minDate"
            :maxDate="maxDate"
            @changed="changedEmbeddingAction"
            @removed="removedEmbeddingAction"
            @daterange-changed="daterangeChangedEmbeddingAction"
          />
        </div>
      </div>
    `
  })
}
