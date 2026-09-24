import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse } from 'msw'
import ListOfSearchFacetsStackedBars from './ListOfSearchFacetsStackedBars.vue'
import type { ListOfSearchFacetsStackedBarsProps } from './ListOfSearchFacetsStackedBars.vue'

const defaultFacetTypes: ListOfSearchFacetsStackedBarsProps['facetTypes'] = [
  'newspaper',
  'type',
  'country',
  'language',
  'person',
  'location',
  'topic',
  'organisation',
  'nag'
]

const successResponse = {
  data: [
    {
      type: 'newspaper',
      numBuckets: 3,
      buckets: [
        { value: 'gdl', val: 'gdl', count: 42, item: { id: 'gdl', name: 'Gazette de Lausanne' } },
        { value: 'jdg', val: 'jdg', count: 28, item: { id: 'jdg', name: 'Journal de Geneve' } },
        { value: 'lts', val: 'lts', count: 15, item: { id: 'lts', name: 'Le Temps' } }
      ]
    },
    {
      type: 'language',
      numBuckets: 3,
      buckets: [
        { value: 'fr', val: 'fr', count: 80, item: { id: 'fr', name: 'French' } },
        { value: 'de', val: 'de', count: 25, item: { id: 'de', name: 'German' } },
        { value: 'it', val: 'it', count: 14, item: { id: 'it', name: 'Italian' } }
      ]
    },
    {
      type: 'country',
      numBuckets: 2,
      buckets: [
        { value: 'ch', val: 'ch', count: 77, item: { id: 'ch', name: 'Switzerland' } },
        { value: 'fr', val: 'fr', count: 13, item: { id: 'fr', name: 'France' } }
      ]
    }
  ]
}

const meta: Meta<typeof ListOfSearchFacetsStackedBars> = {
  title: 'components/ListOfSearchFacetsStackedBars',
  component: ListOfSearchFacetsStackedBars,
  tags: ['autodocs'],
  render: args => ({
    components: { ListOfSearchFacetsStackedBars },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100%; max-width: 1200px;">
        <ListOfSearchFacetsStackedBars v-bind="args" />
      </div>
    `
  }),
  parameters: {
    msw: {
      handlers: [
        http.get('/api/search-facets/tr-passages', async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json(successResponse)
        })
      ]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    searchIndex: 'tr_passages',
    facetTypes: defaultFacetTypes,
    filters: [],
    limit: 10,
    fetchItemsWhenVisible: true
  } as ListOfSearchFacetsStackedBarsProps
}

export const Empty: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/search-facets/tr-passages', async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json({ data: [] })
        })
      ]
    }
  }
}

export const Error: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/search-facets/tr-passages', async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json({ message: 'Error loading facets' }, { status: 500 })
        })
      ]
    }
  }
}

export const Loading: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/search-facets/tr-passages', async () => {
          await new Promise(resolve => setTimeout(resolve, 6000))
          return HttpResponse.json(successResponse)
        })
      ]
    }
  }
}
