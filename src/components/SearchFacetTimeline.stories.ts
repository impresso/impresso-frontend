import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SearchFacetTimeline from './SearchFacetTimeline.vue'
import type { SearchFacetTimelineProps } from './SearchFacetTimeline.vue'
import { findSearchFacetsHandler } from '.storybook/mswHandlers'

const meta: Meta<typeof SearchFacetTimeline> = {
  title: 'components/SearchFacetTimeline',
  component: SearchFacetTimeline,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        SearchFacetTimeline
      },
      template: `
        <div style="width: 600px; padding: 16px">
          <SearchFacetTimeline v-bind="args" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [findSearchFacetsHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    facetType: 'year',
    searchIndex: 'search',
    title: 'Articles over time',
    height: '85px'
  } as SearchFacetTimelineProps
}

export const NoTitle: Story = {
  args: {
    facetType: 'year',
    searchIndex: 'search',
    height: '120px'
  } as SearchFacetTimelineProps
}

export const WithTooltip: Story = {
  args: {
    facetType: 'year',
    searchIndex: 'search',
    height: '220px'
  } as SearchFacetTimelineProps,
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        SearchFacetTimeline
      },
      template: `
        <div style="width: 600px; padding: 16px">
          <SearchFacetTimeline v-bind="args">
            <template #tooltip="{ tooltip }">
              <div v-if="tooltip?.item">
                {{ tooltip.item?.value }} - {{ tooltip.item?.count }}
              </div>
            </template>
          </SearchFacetTimeline>
        </div>
      `
    }
  }
}
