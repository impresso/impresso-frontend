import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref, watch } from 'vue'
import { action } from 'storybook/actions'
import FilterMonitorOptions from './FilterMonitorOptions.vue'
import type { FilterMonitorFilter } from './FilterMonitorPermission.vue'

const cloneFilter = (filter: FilterMonitorFilter): FilterMonitorFilter => ({
  ...filter,
  q: Array.isArray(filter.q) ? [...filter.q] : filter.q,
  items: filter.items ? filter.items.map(item => ({ ...item })) : []
})

const baseFilter: FilterMonitorFilter = {
  type: 'country',
  op: 'OR',
  context: 'include',
  q: ['CH', 'FR'],
  items: [
    { id: 'CH', label: 'Switzerland' },
    { id: 'FR', label: 'France' }
  ]
}

const meta: Meta<typeof FilterMonitorOptions> = {
  title: 'Components/Modules/FilterMonitorOptions',
  component: FilterMonitorOptions,
  tags: ['autodocs'],
  argTypes: {
    asDropdown: {
      control: 'boolean'
    },
    operators: {
      control: 'object'
    },
    contexts: {
      control: 'object'
    },
    filter: {
      control: 'object'
    }
  },
  render: args => ({
    components: { FilterMonitorOptions },
    setup() {
      const updateFilterAction = action('update:filter')
      const filter = ref<FilterMonitorFilter>(cloneFilter(args.filter))

      watch(
        () => args.filter,
        nextFilter => {
          filter.value = cloneFilter(nextFilter)
        },
        { deep: true }
      )

      const onUpdateFilter = (nextFilter: FilterMonitorFilter) => {
        updateFilterAction(nextFilter)
        filter.value = cloneFilter(nextFilter)
      }

      const serializedFilter = computed(() => JSON.stringify(filter.value, null, 2))

      return {
        args,
        filter,
        serializedFilter,
        onUpdateFilter
      }
    },
    template: `
      <div style="max-width: 620px; padding: 1rem; border: 1px solid #d8dee3; border-radius: 8px; background: #fff;">
        <FilterMonitorOptions
          :asDropdown="args.asDropdown"
          :operators="args.operators"
          :contexts="args.contexts"
          :filter="filter"
          @update:filter="onUpdateFilter"
        />
        <div style="margin-top: 1rem; font-size: 12px; color: #5b6670;">
          <strong>Reactive filter model</strong>
          <pre style="margin-top: 0.5rem; padding: 0.75rem; background: #f8fafc; border: 1px solid #d8dee3; border-radius: 6px;">{{ serializedFilter }}</pre>
        </div>
      </div>
    `
  }),
  args: {
    asDropdown: true,
    operators: ['OR', 'AND'],
    contexts: ['include', 'exclude'],
    filter: baseFilter
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const DropdownMode: Story = {
  args: {
    asDropdown: true
  }
}

export const RadioMode: Story = {
  args: {
    asDropdown: false
  }
}

export const EmbeddingContext: Story = {
  args: {
    asDropdown: true,
    filter: {
      type: 'embedding',
      op: 'AND',
      context: 'exclude',
      q: ['industrial revolution'],
      items: [{ id: 'embedding-1', label: 'industrial revolution' }]
    }
  }
}
