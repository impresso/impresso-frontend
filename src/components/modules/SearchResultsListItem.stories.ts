import { ContentItem } from '@/models/generated/schemas/contentItem'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse } from 'msw'
import { vueRouter } from 'storybook-vue3-router'
import SearchResultsListItem from './SearchResultsListItem.vue'

const meta: Meta<typeof SearchResultsListItem> = {
  component: SearchResultsListItem,
  title: 'Components/Modules/SearchResultsListItem',
  tags: ['autodocs'],
  parameters: {},
  decorators: [
    vueRouter([
      {
        name: 'article',
        path: '/article/:issue_uid/:page_uid/:article_uid',
        redirect: '/nothing',
        beforeEnter: fn(() => false)
      },
      {
        name: 'issue',
        path: '/issue/:issue_uid',
        redirect: '/nothing',
        beforeEnter: fn(() => false)
      },
      {
        name: 'collection',
        path: '/collections/:collection_uid',
        redirect: '/nothing',
        beforeEnter: fn(() => false)
      }
    ])
  ]
}

export default meta
type Story = StoryObj<typeof SearchResultsListItem>

// Create a realistic ContentItem mock based on the schema
const mockContentItem: ContentItem = {
  id: 'gdl-1890-01-01-a-i0001',
  issueId: 'gdl-1890-01-01-i',
  meta: {
    sourceType: 'newspaper',
    sourceMedium: 'print',
    mediaId: 'GDL',
    date: '1890-01-01T00:00:00Z',
    partnerId: 'SBC',
    countryCode: 'CH'
  },
  text: {
    documentType: 'ci',
    itemType: 'ar',
    langCode: 'fr',
    contentLength: 1500,
    snippet:
      'This is a short excerpt of the article content. It gives a glimpse of what the article is about and contains some sample text for display purposes.',
    title: 'A sample article title with <em>highlighting</em>',
    content:
      'Full content of the article with detailed text that would normally appear in a newspaper article from the late 19th century.',
    matches: [
      {
        fragment: '... a sample <em>match</em> ...',
        coords: [100, 150, 200, 180],
        pageUid: 'page-1',
        iiif: 'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json'
      },
      {
        fragment: '... another <em>match</em> from the article...',
        coords: [120, 200, 250, 230],
        pageUid: 'page-1',
        iiif: 'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json'
      }
    ]
  },
  semanticEnrichments: {
    ocrQuality: 0.85,
    namedEntities: {
      persons: [
        { id: 'per1', label: 'John Doe', count: 10 },
        { id: 'per2', label: 'Jane Smith', count: 4 }
      ],
      locations: [
        { id: 'loc1', label: 'Geneva', count: 5 },
        { id: 'loc2', label: 'Lausanne', count: 3 },
        { id: 'loc3', label: 'Zurich', count: 2 }
      ],
      organisations: [{ id: 'org1', label: 'Federal Council', count: 3 }]
    },
    topics: [
      { relevance: 0.9, id: 'topic1', label: 'Politics', languageCode: 'fr' },
      { relevance: 0.75, id: 'topic2', label: 'Economy', languageCode: 'fr' },
      { relevance: 0.5, id: 'topic3', label: 'Culture', languageCode: 'fr' }
    ],
    collections: [
      {
        uid: 'coll1',
        name: 'My Research Collection',
        description: 'A collection for research purposes',
        status: 'active',
        creationDate: '2024-01-01T00:00:00Z',
        lastModifiedDate: '2024-01-15T00:00:00Z',
        countItems: 25,
        creator: {
          uid: 'user1',
          username: 'researcher'
        }
      }
    ]
  },
  image: {
    pagesCount: 2,
    isFrontPage: false,
    isCoordinatesConverted: true,
    pages: [
      {
        id: 'page-1',
        number: 1,
        regionCoordinates: [
          [100, 150, 200, 180],
          [120, 200, 250, 230]
        ],
        iiif: {
          manifestUrl:
            'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json',
          thumnbnailUrl: 'https://example.com/iiif/thumbnail'
        }
      },
      {
        id: 'page-2',
        number: 2,
        regionCoordinates: [[50, 100, 150, 130]],
        iiif: {
          manifestUrl:
            'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json',
          thumnbnailUrl: 'https://example.com/iiif/thumbnail2'
        }
      }
    ],
    lineBreaks: [450, 890, 1200],
    regionBreaks: [0, 600, 1200]
  },
  access: {
    dataDomain: 'pbl',
    copyright: 'pbl'
  }
}

// ContentItem without collections
const mockContentItemNoCollections: ContentItem = {
  ...mockContentItem,
  semanticEnrichments: {
    ...mockContentItem.semanticEnrichments,
    collections: []
  }
}

// ContentItem with OpenPublic access
const mockContentItemOpenPublic: ContentItem = {
  ...mockContentItem,
  access: {
    dataDomain: 'pbl',
    copyright: 'pbl'
  }
}

export const Default: Story = {
  args: {
    modelValue: mockContentItem,
    checkbox: false,
    checked: false,
    showContext: false
  }
}

export const WithCheckbox: Story = {
  args: {
    ...Default.args,
    checkbox: true,
    checked: false
  }
}

export const CheckboxChecked: Story = {
  args: {
    ...Default.args,
    checkbox: true,
    checked: true
  }
}

export const WithContext: Story = {
  args: {
    ...Default.args,
    showContext: true
  }
}

export const NoCollections: Story = {
  args: {
    ...Default.args,
    modelValue: mockContentItemNoCollections
  }
}

export const OpenPublicAccess: Story = {
  args: {
    ...Default.args,
    modelValue: mockContentItemOpenPublic
  }
}

export const FullFeatures: Story = {
  args: {
    modelValue: mockContentItemOpenPublic,
    checkbox: true,
    checked: false,
    showContext: true
  }
}
