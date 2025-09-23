import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SearchFacets from './SearchFacets.vue'
import { Facet } from '@/models'
import FacetModel from '@/models/Facet'
import BucketModel from '@/models/Bucket'
import FilterFactory from '@/models/FilterFactory'

// Define the component metadata
const meta: Meta<typeof SearchFacets> = {
  title: 'Components/SearchFacets',
  component: SearchFacets,
  tags: ['autodocs'],
  argTypes: {
    groupBy: {
      control: 'select',
      options: ['articles', 'images'],
      description: 'Group by articles or images'
    },
    filters: {
      control: 'object',
      description: 'Array of filters'
    },
    facets: {
      control: 'object',
      description: 'Array of facets'
    },
    startYear: {
      control: 'number',
      description: 'Start year for timeline'
    },
    endYear: {
      control: 'number',
      description: 'End year for timeline'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'A component for displaying and managing search facets including timeline, range, and standard facets.'
      }
    }
  }
}

export default meta

type Story = StoryObj<typeof SearchFacets>

// Create sample data for the stories
const createYearFacet = (): Facet => {
  const buckets = Array.from({ length: 10 }).map((_, i) => {
    const year = 1950 + i * 5
    return new BucketModel({
      val: year.toString(),
      count: Math.floor(Math.random() * 1000) + 100,
      item: { uid: year.toString(), y: year.toString() },
      type: 'year'
    })
  })

  return new FacetModel({
    type: 'year',
    numBuckets: buckets.length,
    buckets
  })
}

const createNewspaperFacet = (): Facet => {
  const newspapers = [
    { uid: 'GDL', name: 'Gazette de Lausanne' },
    { uid: 'JDG', name: 'Journal de Genève' },
    { uid: 'LNF', name: 'Le Nouvelliste' },
    { uid: 'LES', name: "L'Express" },
    { uid: 'LTS', name: 'Le Temps' }
  ]

  const buckets = newspapers.map(newspaper => {
    return new BucketModel({
      val: newspaper.uid,
      count: Math.floor(Math.random() * 500) + 50,
      item: newspaper,
      type: 'newspaper'
    })
  })

  return new FacetModel({
    type: 'newspaper',
    numBuckets: buckets.length,
    buckets
  })
}

const createLanguageFacet = (): Facet => {
  const languages = [
    { uid: 'fr', name: 'French' },
    { uid: 'de', name: 'German' },
    { uid: 'it', name: 'Italian' },
    { uid: 'en', name: 'English' }
  ]

  const buckets = languages.map(language => {
    return new BucketModel({
      val: language.uid,
      count: Math.floor(Math.random() * 800) + 200,
      item: language,
      type: 'language'
    })
  })

  return new FacetModel({
    type: 'language',
    numBuckets: buckets.length,
    buckets
  })
}

const createContentLengthFacet = (): Facet => {
  const buckets = Array.from({ length: 5 }).map((_, i) => {
    const length = 100 * (i + 1)
    return new BucketModel({
      val: length.toString(),
      count: Math.floor(Math.random() * 500) + 50,
      item: { uid: length.toString() },
      type: 'contentLength'
    })
  })

  return new FacetModel({
    type: 'contentLength',
    numBuckets: buckets.length,
    buckets
  })
}

// Basic story with default values
export const Default: Story = {
  args: {
    groupBy: 'articles',
    filters: [],
    facets: [
      createYearFacet(),
      createNewspaperFacet(),
      createLanguageFacet(),
      createContentLengthFacet()
    ],
    startYear: 1950,
    endYear: 2000
  }
}

// Story with some active filters
export const WithFilters: Story = {
  args: {
    ...Default.args,
    filters: [
      FilterFactory.create({
        type: 'newspaper',
        q: ['GDL', 'JDG'],
        context: 'include',
        items: [
          { uid: 'GDL', name: 'Gazette de Lausanne' },
          { uid: 'JDG', name: 'Journal de Genève' }
        ]
      }),
      FilterFactory.create({
        type: 'language',
        q: ['fr'],
        context: 'include',
        items: [{ uid: 'fr', name: 'French' }]
      }),
      FilterFactory.create({
        type: 'daterange',
        q: ['1960-01-01T00:00:00Z TO 1980-12-31T23:59:59Z'],
        items: [
          {
            start: new Date('1960-01-01'),
            end: new Date('1980-12-31')
          }
        ]
      })
    ]
  }
}

// Story with images grouping
export const ImagesGrouping: Story = {
  args: {
    ...Default.args,
    groupBy: 'images'
  }
}

// Story with content length filter
export const WithContentLengthFilter: Story = {
  args: {
    ...Default.args,
    filters: [
      FilterFactory.create({
        type: 'contentLength',
        q: ['100', '300'],
        context: 'include'
      })
    ]
  }
}

// Story with loading state
export const Loading: Story = {
  args: {
    ...Default.args,
    facets: [
      createYearFacet(),
      createNewspaperFacet(),
      createLanguageFacet(),
      createContentLengthFacet()
    ].map(facet => ({
      ...facet,
      buckets: []
    }))
  }
}
