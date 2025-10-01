import { BaseFindResponse, Collection } from '@/models/generated/schemasPublic'
import { fn } from '@storybook/test'
import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse } from 'msw'
import { vueRouter } from 'storybook-vue3-router'
import CollectionAddTo from './CollectionAddTo.vue'
import { ItemWithCollections } from './CollectionAddToList.vue'

// Handlers for empty collections state
const emptyCollectionsHandler = http.get('/api/collections', () => {
  return HttpResponse.json({
    total: 0,
    limit: 25,
    skip: 0,
    data: []
  })
})

// Handler for loading state (delayed response)
const loadingCollectionsHandler = http.get('/api/collections', () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        HttpResponse.json({
          pagination: {
            total: 1,
            limit: 25,
            offset: 0
          },
          data: [
            {
              uid: 'coll1',
              title: 'My Research Collection',
              description: 'A collection for research purposes',
              accessLevel: 'private' as const,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-15T00:00:00Z',
              totalItems: 25,
              creatorId: 'researcher'
            }
          ] satisfies Collection[]
        } satisfies BaseFindResponse)
      )
    }, 2000)
  })
})

// Handlers for error states
const errorCollectionsHandlers = [
  http.get('/api/collections', () => {
    return HttpResponse.json({ error: 'Collections service unavailable' }, { status: 503 })
  }),
  http.post('/api/collections', () => {
    return HttpResponse.json({ error: 'Cannot create collection' }, { status: 500 })
  })
]

// Handler for logged out user
const loggedOutHandler = http.get('/api/me', () => {
  return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
})

const meta: Meta<typeof CollectionAddTo> = {
  component: CollectionAddTo,
  title: 'Components/Modules/CollectionAddTo',
  tags: ['autodocs'],
  parameters: {},

  render: args => {
    return {
      components: { CollectionAddTo },
      setup() {
        return { args }
      },
      template: '<CollectionAddTo  v-bind="args" />'
    }
  },
  decorators: [
    vueRouter([
      {
        name: 'login',
        path: '/login',
        redirect: '/nothing',
        beforeEnter: fn(() => false)
      }
    ])
  ]
}

export default meta
type Story = StoryObj<typeof CollectionAddTo>

// Mock items data
const mockSingleItem: ItemWithCollections[] = [
  {
    itemId: 'article-123',
    collectionIds: ['coll1'] // Already in "My Research Collection"
  }
]

const mockMultipleItems: ItemWithCollections[] = [
  {
    itemId: 'article-123',
    collectionIds: ['coll1'] // In "My Research Collection"
  },
  {
    itemId: 'article-456',
    collectionIds: ['coll2'] // In "Historical Articles"
  },
  {
    itemId: 'article-789',
    collectionIds: ['coll1', 'coll2'] // In both collections
  }
]

const mockNoCollectionsItems: ItemWithCollections[] = [
  {
    itemId: 'article-999',
    collectionIds: [] // Not in any collection
  }
]

export const Default: Story = {
  args: {
    items: mockSingleItem,
    text: 'Add to Collection'
  }
}

export const MultipleItems: Story = {
  args: {
    items: mockMultipleItems,
    text: 'Add 3 items'
  }
}

export const NoCollectionsAssigned: Story = {
  args: {
    items: mockNoCollectionsItems,
    text: 'Add to Collection'
  }
}

export const CustomButtonText: Story = {
  args: {
    items: mockSingleItem,
    text: 'Save to my collections'
  }
}

export const LoggedOutUser: Story = {
  args: {
    items: mockSingleItem,
    text: 'Add to Collection'
  },
  parameters: {
    msw: {
      handlers: [loggedOutHandler]
    }
  }
}

export const LoadingCollections: Story = {
  args: {
    items: mockSingleItem,
    text: 'Add to Collection'
  },
  parameters: {
    msw: {
      handlers: [loadingCollectionsHandler]
    }
  }
}

export const EmptyCollections: Story = {
  args: {
    items: mockSingleItem,
    text: 'Add to Collection'
  },
  parameters: {
    msw: {
      handlers: [emptyCollectionsHandler]
    }
  }
}

export const FailingAPIResponses: Story = {
  args: {
    items: mockSingleItem,
    text: 'Add to Collection'
  },
  parameters: {
    msw: {
      handlers: errorCollectionsHandlers
    }
  }
}

export const WithSearchFiltering: Story = {
  args: {
    items: mockMultipleItems,
    text: 'Add to Collection'
  },
  parameters: {
    docs: {
      description: {
        story: 'Type "Historical" or "Swiss" in the search box to see filtering in action'
      }
    }
  }
}

export const CreateNewCollection: Story = {
  args: {
    items: mockSingleItem,
    text: 'Add to Collection',
    initialIsOpen: true
  },
  parameters: {
    docs: {
      description: {
        story:
          'Type a new collection name (3+ characters) and click "Create new" to test collection creation'
      }
    }
  }
}
