import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaristaButton from './BaristaButton.vue'
import { getBaristaFiltersItemsHandler } from '.storybook/mswHandlers'
import {
  MockBaristaSearchFilters,
  MockBaristaSuggestedFilters
} from '.storybook/mockData/baristaFilters'
import { useBaristaStore } from '@/stores/barista'
import type { BaristaMessageItem } from '@/services/types/barista'

/**
 * BaristaButton is a floating button that opens a BaristaChat popup when clicked.
 * It is designed to be placed anywhere on the page and remains visible on top of other content.
 */
const meta = {
  title: 'Barista/BaristaButton',
  component: BaristaButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A floating button that opens the BaristaChat interface in a popup.'
      }
    }
  },
  argTypes: {}
} satisfies Meta<typeof BaristaButton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default implementation of the BaristaButton.
 * This component is designed to be placed anywhere in any page.
 */
export const Default: Story = {
  args: {}
}

/**
 * With filters from the current search, shared with Barista.
 */
export const WithSearchFilters: Story = {
  args: {
    filters: MockBaristaSuggestedFilters
  },
  parameters: {
    msw: {
      handlers: { getFiltersItems: [getBaristaFiltersItemsHandler] }
    }
  }
}

/**
 * Barista answered with filters that differ from the current search:
 * the filters panel tells what applying them changes.
 */
export const WithBaristaSuggestion: Story = {
  args: {
    filters: MockBaristaSearchFilters
  },
  parameters: {
    msw: {
      handlers: { getFiltersItems: [getBaristaFiltersItemsHandler] }
    }
  },
  render: args => ({
    components: { BaristaButton },
    setup() {
      const baristaStore = useBaristaStore()
      baristaStore.createNewSession()
      const streamMessage = (message: Record<string, unknown>) =>
        baristaStore.parseBaristaStream({
          type: 'chunk',
          data: [{ ...message, sessionId: baristaStore.sessionId } as BaristaMessageItem]
        })
      const seedConversation = () => {
        if (baristaStore.messages.length) return
        setTimeout(() => {
          streamMessage({
            type: 'human',
            content: 'Find articles about Robert Schumann in Luxembourg newspapers'
          })
        }, 600)
        setTimeout(() => {
          streamMessage({
            type: 'ai',
            content:
              'I kept your newspaper filter and added **Robert Schumann** as a person and as a keyword.',
            structuredResponse: { searchQuery: { filters: MockBaristaSuggestedFilters } }
          })
          baristaStore.parseBaristaStream({ type: 'done', data: [] })
        }, 1200)
      }
      return { args, seedConversation }
    },
    template: `<BaristaButton v-bind="args" @click="seedConversation" />`
  })
}

/**
 * Opens Barista directly in the compact, draggable window.
 */
export const CompactWindow: Story = {
  args: {
    initialMode: 'compact'
  }
}
