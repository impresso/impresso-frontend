import type { Meta, StoryObj } from '@storybook/vue3'
import DivergingBarsChartPanel from '../DivergingBarsChartPanel.vue'
import type { FacetContainer, FacetItem } from '../DivergingBarsChartPanel.vue'

interface ComponentProps {
  facets: FacetContainer[]
  scale?: string
  roundValueFn?: (value: number) => string
}

const meta: Meta<ComponentProps> = {
  title: 'Components/Modules/SearchQueriesComparison/DivergingBarsChartPanel',
  component: DivergingBarsChartPanel,
  tags: ['autodocs'],
  argTypes: {
    scale: {
      control: 'select',
      options: ['linear', 'sqrt']
    }
  },
  args: {
    scale: 'linear'
  },
  render: args => {
    return {
      components: { DivergingBarsChartPanel },
      setup() {
        const handleLoadMoreItems = (facet: FacetContainer) => {
          console.log('Load more items for facet:', facet.id)
        }
        
        return { 
          args,
          handleLoadMoreItems
        }
      },
      template: '<DivergingBarsChartPanel v-bind="args" @load-more-items="handleLoadMoreItems" />'
    }
  }
} satisfies Meta<typeof DivergingBarsChartPanel>

export default meta
type Story = StoryObj<typeof meta>

// Helper function to generate mock facet items
const generateFacetItems = (facetType: string, count: number): FacetItem[] => {
  const baseNames = {
    newspaper: ['The Times', 'Le Monde', 'Corriere della Sera', 'El País', 'Frankfurter Allgemeine', 'The Guardian', 'La Repubblica', 'Die Zeit'],
    language: ['English', 'French', 'German', 'Italian', 'Spanish', 'Portuguese', 'Dutch', 'Russian'],
    country: ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Austria'],
    topic: ['Politics', 'Economy', 'Culture', 'Science', 'Sports', 'Technology', 'Health', 'Education'],
    person: ['Napoleon Bonaparte', 'Marie Curie', 'Albert Einstein', 'Winston Churchill', 'Charles Darwin', 'Leonardo da Vinci', 'Shakespeare', 'Beethoven'],
    location: ['Paris', 'London', 'Berlin', 'Rome', 'Madrid', 'Amsterdam', 'Vienna', 'Zurich']
  }
  
  const names = baseNames[facetType] || Array.from({ length: count }, (_, i) => `${facetType} ${i + 1}`)
  
  return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
    label: names[i],
    left: Math.floor(Math.random() * 500) + 100,
    right: Math.floor(Math.random() * 500) + 100,
    intersection: Math.floor(Math.random() * 200) + 50
  }))
}

// Helper function to generate mock facet containers
const generateFacetContainer = (facetId: string, itemCount: number, totalBuckets?: number): FacetContainer => ({
  id: facetId,
  items: generateFacetItems(facetId, itemCount),
  numBuckets: totalBuckets || itemCount
})

// Default round value function for stories
const defaultRoundValueFn = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export const SingleFacetNewspaper: Story = {
  args: {
    facets: [generateFacetContainer('newspaper', 5)],
    roundValueFn: defaultRoundValueFn
  }
}

export const SingleFacetLanguage: Story = {
  args: {
    facets: [generateFacetContainer('language', 4)],
    roundValueFn: defaultRoundValueFn
  }
}

export const MultipleFacets: Story = {
  args: {
    facets: [
      generateFacetContainer('newspaper', 3),
      generateFacetContainer('language', 4),
      generateFacetContainer('country', 5)
    ],
    roundValueFn: defaultRoundValueFn
  }
}

export const MultipleFacetsWithLoadMore: Story = {
  args: {
    facets: [
      generateFacetContainer('newspaper', 3, 8),
      generateFacetContainer('language', 2, 6),
      generateFacetContainer('topic', 4, 12)
    ],
    roundValueFn: defaultRoundValueFn
  }
}

export const LargeFacetSet: Story = {
  args: {
    facets: [
      generateFacetContainer('newspaper', 6),
      generateFacetContainer('language', 5),
      generateFacetContainer('country', 6),
      generateFacetContainer('topic', 5),
      generateFacetContainer('person', 4),
      generateFacetContainer('location', 5)
    ],
    roundValueFn: defaultRoundValueFn
  }
}

export const SquareRootScale: Story = {
  args: {
    facets: [
      generateFacetContainer('newspaper', 4),
      generateFacetContainer('language', 3)
    ],
    scale: 'sqrt',
    roundValueFn: defaultRoundValueFn
  }
}

export const HighIntersectionValues: Story = {
  args: {
    facets: [
      {
        id: 'newspaper',
        numBuckets: 4,
        items: [
          { label: 'The Times', left: 1500, right: 1200, intersection: 800 },
          { label: 'Le Monde', left: 1800, right: 1600, intersection: 900 },
          { label: 'Corriere della Sera', left: 1200, right: 1400, intersection: 700 },
          { label: 'El País', left: 1000, right: 1100, intersection: 650 }
        ]
      }
    ],
    roundValueFn: defaultRoundValueFn
  }
}

export const LowIntersectionValues: Story = {
  args: {
    facets: [
      {
        id: 'topic',
        numBuckets: 3,
        items: [
          { label: 'Politics', left: 2000, right: 1800, intersection: 50 },
          { label: 'Economy', left: 1500, right: 1600, intersection: 30 },
          { label: 'Culture', left: 1200, right: 1400, intersection: 25 }
        ]
      }
    ],
    roundValueFn: defaultRoundValueFn
  }
}

export const EmptyFacets: Story = {
  args: {
    facets: [],
    roundValueFn: defaultRoundValueFn
  }
}

export const FacetsWithEmptyItems: Story = {
  args: {
    facets: [
      { id: 'newspaper', items: [], numBuckets: 0 },
      { id: 'language', items: [], numBuckets: 0 }
    ],
    roundValueFn: defaultRoundValueFn
  }
}

export const CustomRoundingFunction: Story = {
  args: {
    facets: [generateFacetContainer('newspaper', 4)],
    roundValueFn: (value: number) => {
      // Custom function that shows exact values for small numbers, abbreviated for large
      if (value < 100) {
        return value.toString()
      } else if (value < 10000) {
        return `~${Math.round(value / 100) * 100}`
      } else {
        return `${Math.round(value / 1000)}k`
      }
    }
  }
}

export const RealWorldExample: Story = {
  args: {
    facets: [
      {
        id: 'newspaper',
        numBuckets: 12,
        items: [
          { label: 'Journal de Genève', left: 2341, right: 1876, intersection: 432 },
          { label: 'Le Temps', left: 1987, right: 2156, intersection: 389 },
          { label: 'Gazette de Lausanne', left: 1654, right: 1432, intersection: 287 },
          { label: 'Feuille d\'Avis de Lausanne', left: 1234, right: 1567, intersection: 201 },
          { label: 'Tribune de Genève', left: 967, right: 1123, intersection: 156 }
        ]
      },
      {
        id: 'language',
        numBuckets: 6,
        items: [
          { label: 'French', left: 8934, right: 7623, intersection: 1876 },
          { label: 'German', left: 5432, right: 6234, intersection: 1234 },
          { label: 'Italian', left: 2341, right: 2567, intersection: 567 },
          { label: 'English', left: 1876, right: 1654, intersection: 234 }
        ]
      }
    ],
    roundValueFn: (value: number) => {
      return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    }
  }
}