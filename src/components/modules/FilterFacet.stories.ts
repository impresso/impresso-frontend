import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FilterFacet from './FilterFacet.vue'
import type { Filter, Bucket } from '@/models'
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
const createMockBuckets = (type: string, count: number, withItems = true): Bucket[] => {
  return Array.from({ length: count }, (_, i) => {
    const val = type === 'newspaper' ? `newspaper-${i + 1}` : `${i + 1}`

    const bucket: any = {
      val,
      count: Math.floor(Math.random() * 1000) + 50,
      type
    }

    if (withItems) {
      bucket.item = {
        uid: val,
        name:
          type === 'newspaper'
            ? `Newspaper ${i + 1}`
            : type === 'language'
              ? ['English', 'French', 'German', 'Italian'][i % 4]
              : type === 'topic'
                ? `Topic ${i + 1}`
                : type === 'person'
                  ? `Person ${i + 1}`
                  : `Item ${i + 1}`,
        fr: type === 'language' ? ['Anglais', 'Français', 'Allemand', 'Italien'][i % 4] : undefined
      }
    }

    return new BucketModel(bucket)
  })
}

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
      operators: ['AND', 'OR', 'NOT']
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
      operators: ['AND', 'OR', 'NOT']
    }),
    facetFilters: [
      {
        type: 'newspaper',
        q: ['newspaper-1', 'newspaper-2'],
        context: 'include',
        items: [
          { uid: 'newspaper-1', name: 'Newspaper 1' },
          { uid: 'newspaper-2', name: 'Newspaper 2' }
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
      operators: ['AND', 'OR', 'NOT']
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
      operators: ['AND', 'OR', 'NOT']
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
      operators: ['AND', 'OR', 'NOT']
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
      operators: ['AND', 'OR', 'NOT']
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
          { uid: 'newspaper-1', name: 'Newspaper 1' },
          { uid: 'newspaper-2', name: 'Newspaper 2' }
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
      operators: ['AND', 'OR', 'NOT']
    })
  }
}
