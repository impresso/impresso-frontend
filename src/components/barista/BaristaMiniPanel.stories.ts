import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import BaristaMiniPanel from './BaristaMiniPanel.vue'
import type { BaristaMiniPanelProps } from './BaristaMiniPanel.vue'
import { useBaristaStore } from '@/stores/barista'
import type { BaristaMessageItem } from '@/services/types/barista'
import { getBaristaFiltersItemsHandler } from '.storybook/mswHandlers'
import {
  MockBaristaSearchFilters,
  MockBaristaSuggestedFilters
} from '.storybook/mockData/baristaFilters'

const MockConversationItems: BaristaMessageItem[] = [
  {
    sessionId: 'story-session',
    type: 'human',
    content: 'Find articles about Robert Schumann in Luxembourg newspapers'
  },
  {
    sessionId: 'story-session',
    type: 'ai',
    content:
      'I added a person filter for **Robert Schumann** and kept your newspaper filter. Apply them to see the matching articles.',
    structuredResponse: {
      searchQuery: { filters: MockBaristaSuggestedFilters }
    }
  }
] as BaristaMessageItem[]

/**
 * Compact, draggable Barista window. It floats over the search results so the
 * user can keep working with Barista while seeing the effect of the suggested filters.
 */
const meta: Meta<typeof BaristaMiniPanel> = {
  title: 'Barista/BaristaMiniPanel',
  component: BaristaMiniPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: { getFiltersItems: [getBaristaFiltersItemsHandler] }
    }
  },
  args: {
    filters: MockBaristaSearchFilters,
    onDismiss: fn(),
    onExpand: fn(),
    onApplyFilters: fn()
  },
  render: args => ({
    components: { BaristaMiniPanel },
    setup() {
      const baristaStore = useBaristaStore()
      baristaStore.createNewSession()
      return { args }
    },
    template: `
      <div style="height: 100vh; padding: 2rem; background: var(--impresso-color-paper)">
        <h1 class="h3">Search results</h1>
        <p class="text-muted">Drag the Barista window by its header.</p>
        <BaristaMiniPanel v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {} as BaristaMiniPanelProps
}

export const WithConversation: Story = {
  args: {
    suggestedFilters: MockBaristaSuggestedFilters
  } as BaristaMiniPanelProps,
  render: args => ({
    components: { BaristaMiniPanel },
    setup() {
      const baristaStore = useBaristaStore()
      baristaStore.createNewSession()
      baristaStore.parseBaristaStream({
        type: 'chunk',
        data: MockConversationItems.map(item => ({ ...item, sessionId: baristaStore.sessionId }))
      })
      baristaStore.parseBaristaStream({ type: 'done', data: [] })
      return { args }
    },
    template: `
      <div style="height: 100vh; padding: 2rem; background: var(--impresso-color-paper)">
        <h1 class="h3">Search results</h1>
        <BaristaMiniPanel v-bind="args" />
      </div>
    `
  })
}
