import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { http, HttpResponse } from 'msw'
import FilterFacet from './FilterFacet.vue'
import type { Bucket, Facet, Filter } from '@/models'
import FacetModel from '@/models/Facet'
import BucketModel from '@/models/Bucket'

/**
 * FilterFacet component displays a list of facet buckets for filtering search results.
 * It allows users to select multiple values, apply filters, and reset them.
 */
const meta = {
  title: 'Modules/FilterFacet',
  component: FilterFacet,
  tags: ['autodocs'],
  argTypes: {
    facet: {
      description: 'The facet object containing buckets and type information',
      control: 'object'
    },
    facetFilters: {
      description: 'Array of applied filters',
      control: 'object'
    },
    contextFilters: {
      description: 'Filters used to narrow down the search for new facet filters',
      control: 'object'
    },
    isLoading: {
      description: 'Whether the facet is loading',
      control: 'boolean'
    },
    collapsible: {
      description: 'Whether the facet can be collapsed',
      control: 'boolean'
    },
    lazy: {
      description: 'Whether to use lazy loading for the facet',
      control: 'boolean'
    },
    lazyDelay: {
      description: 'Delay in milliseconds for lazy loading',
      control: 'number'
    },
    searchIndex: {
      description: 'The search index to use',
      control: 'text'
    },
    infoButtonId: {
      description: 'ID for the info button',
      control: 'text'
    }
  },
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof FilterFacet>

export default meta
type Story = StoryObj<typeof meta>

// Helper to create mock buckets with items
const LANGUAGE_NAMES = ['English', 'French', 'German', 'Italian']
const LANGUAGE_NAMES_FR = ['Anglais', 'Français', 'Allemand', 'Italien']

const getBucketName = (type: string, index: number): string => {
  const namesByType: Record<string, (index: number) => string> = {
    newspaper: idx => `Newspaper ${idx + 1}`,
    topic: idx => `Topic ${idx + 1}`,
    person: idx => `Person ${idx + 1}`
  }

  return namesByType[type]?.(index) ?? `Item ${index + 1}`
}

const createMockBuckets = (type: string, count: number): Bucket[] => {
  return Array.from({ length: count }, (_, i) => {
    const value = type === 'newspaper' ? `newspaper-${i + 1}` : `${i + 1}`
    const isLanguage = type === 'language'
    const name = isLanguage ? LANGUAGE_NAMES[i % LANGUAGE_NAMES.length] : getBucketName(type, i)
    const item = {
      id: value,
      name,
      language: isLanguage ? value : undefined,
      ...(isLanguage ? { fr: LANGUAGE_NAMES_FR[i % LANGUAGE_NAMES_FR.length] } : {}),
      label: name
    }

    return new BucketModel({
      value,
      label: name,
      count: 50 + i * 37,
      type,
      item
    })
  })
}

const createTopicBucketPayload = (
  bucketIndex: number
): {
  value: string
  label: string
  count: number
  item: {
    id: string
    label: string
    name: string
    language: string
    htmlExcerpt: string
  }
} => {
  const value = `bucket-${bucketIndex}`
  const name = `Bucket ${bucketIndex}`
  return {
    value,
    label: name,
    count: 10_000 - bucketIndex,
    item: {
      id: value,
      label: name,
      name,
      language: 'en',
      htmlExcerpt: name
    }
  }
}

const totalBucketsInPartiallyLoadedFacet = 29
const getTopicFacetsPage = (offset: number, limit: number) => {
  const endOffset = Math.min(offset + limit, totalBucketsInPartiallyLoadedFacet)
  return Array.from({ length: Math.max(0, endOffset - offset) }, (_, index) => {
    return createTopicBucketPayload(offset + index)
  })
}

const loadMorePartialBucketsHandler = http.get(
  '/api/search-facets/search/topic',
  async ({ request }) => {
    const searchParams = new URL(request.url)
    const offsetParam = Number.parseInt(searchParams.searchParams.get('offset') || '0')
    const limitParam = Number.parseInt(searchParams.searchParams.get('limit') || '10')
    const offset = Number.isNaN(offsetParam) ? 0 : offsetParam
    const limit = Number.isNaN(limitParam) ? 10 : limitParam

    await new Promise(resolve => setTimeout(resolve, 150))

    return HttpResponse.json({
      type: 'topic',
      numBuckets: totalBucketsInPartiallyLoadedFacet,
      buckets: getTopicFacetsPage(offset, limit)
    })
  }
)

const generateSimpleFacet = (numBuckets: number, totalBuckets?: number): Facet => ({
  buckets: Array.from({ length: numBuckets }, (_, i) => ({
    value: `bucket-${i}`,
    item: {
      id: `bucket-${i}`,
      label: `Bucket ${i}`,
      name: `Bucket ${i}`,
      language: 'en',
      htmlExcerpt: `Bucket ${i}`
    },
    count: 100 - i
  })),
  type: 'topic',
  numBuckets: totalBuckets ?? numBuckets
})

/**
 * Default story showing a newspaper facet with no filters applied
 */
export const Default: Story = {
  render: args => ({
    components: { FilterFacet },
    setup() {
      const facetFilters = ref(args.facetFilters || [])

      const handleChanged = (filters: Filter[]) => {
        facetFilters.value = filters
        // Log the filters change
        console.log('Filters changed:', filters)
      }

      return { args, facetFilters, handleChanged }
    },
    template: `
      <div style="width: 300px;">
        <FilterFacet 
          :facet="args.facet" 
          :facetFilters="facetFilters"
          :contextFilters="args.contextFilters"
          :isLoading="args.isLoading"
          :collapsible="args.collapsible"
          :lazy="args.lazy"
          :lazyDelay="args.lazyDelay"
          :searchIndex="args.searchIndex"
          :infoButtonId="args.infoButtonId"
          @changed="handleChanged" 
        />
      </div>
    `
  }),
  args: {
    facet: new FacetModel({
      type: 'newspaper',
      buckets: createMockBuckets('newspaper', 5),
      numBuckets: 20,
      operators: ['AND', 'OR']
    }),
    facetFilters: [],
    contextFilters: [],
    isLoading: false,
    collapsible: true,
    lazy: false,
    searchIndex: 'search'
  }
}

/**
 * With applied filters
 */
export const WithAppliedFilters: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel({
      type: 'newspaper',
      buckets: createMockBuckets('newspaper', 5),
      numBuckets: 20,
      operators: ['AND', 'OR']
    }),
    facetFilters: [
      {
        type: 'newspaper',
        q: ['newspaper-1', 'newspaper-2'],
        context: 'include',
        items: [
          { id: 'newspaper-1', name: 'Newspaper 1' },
          { id: 'newspaper-2', name: 'Newspaper 2' }
        ]
      } as Filter
    ]
  }
}

/**
 * Language facet example
 */
export const LanguageFacet: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel({
      type: 'language',
      buckets: createMockBuckets('language', 4),
      numBuckets: 4,
      operators: ['AND', 'OR']
    }),
    facetFilters: []
  }
}

/**
 * Topic facet example
 */
export const TopicFacet: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel({
      type: 'topic',
      buckets: createMockBuckets('topic', 8),
      numBuckets: 15,
      operators: ['AND', 'OR']
    }),
    facetFilters: [],
    infoButtonId: 'how-to-read-the-topics'
  }
}

/**
 * Person facet example (Named Entity)
 */
export const PersonFacet: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel({
      type: 'person',
      buckets: createMockBuckets('person', 6),
      numBuckets: 25,
      operators: ['AND', 'OR']
    }),
    facetFilters: []
  }
}

/**
 * In loading state
 */
export const Loading: Story = {
  ...Default,
  args: {
    ...Default.args,
    isLoading: true
  }
}

/**
 * Empty state
 */
export const Empty: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel({
      type: 'newspaper',
      buckets: [],
      numBuckets: 0,
      operators: ['AND', 'OR']
    })
  }
}

/**
 * With excluded filters
 */
export const WithExcludedFilters: Story = {
  ...Default,
  args: {
    ...Default.args,
    facetFilters: [
      {
        type: 'newspaper',
        q: ['newspaper-1', 'newspaper-2'],
        context: 'exclude',
        items: [
          { id: 'newspaper-1', name: 'Newspaper 1' },
          { id: 'newspaper-2', name: 'Newspaper 2' }
        ]
      } as Filter
    ]
  }
}

/**
 * With many buckets
 */
export const WithManyBuckets: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel({
      type: 'newspaper',
      buckets: createMockBuckets('newspaper', 15),
      numBuckets: 50,
      operators: ['AND', 'OR']
    })
  }
}

/**
 * No buckets returned for facet
 */
export const NoBuckets: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel(generateSimpleFacet(0))
  }
}

/**
 * Single bucket facet
 */
export const OneBucket: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel(generateSimpleFacet(1))
  }
}

/**
 * All buckets are already loaded
 */
export const MultipleBucketsAllLoaded: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: new FacetModel(generateSimpleFacet(9))
  }
}

/**
 * More buckets available than rendered initially
 */
export const MultipleBucketsPartiallyLoaded: Story = {
  ...Default,
  parameters: {
    msw: {
      handlers: [loadMorePartialBucketsHandler]
    }
  },
  args: {
    ...Default.args,
    collapsible: false,
    facet: new FacetModel(generateSimpleFacet(9, 29))
  }
}
