import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { delay, http, HttpResponse } from 'msw'
import { vueRouter } from 'storybook-vue3-router'
import AddContentItemToSearchButton from '@/components/contentItem/AddContentItemToSearchButton.vue'

const SEARCH_ERROR_MARKER = 'trigger-search-error'

// Counts requests per content item, used by the "flaky" story:
// odd calls fail, even calls succeed (so Retry works, and reopening starts failing again).
const flakyAttempts = new Map<string, number>()

const meta = {
  title: 'components/contentItem/AddContentItemToSearchButton',
  component: AddContentItemToSearchButton,
  tags: ['autodocs'],
  decorators: [
    vueRouter([
      {
        name: 'search',
        path: '/search',
        component: { template: '<div />' },
        // A guard that throws makes router.push() reject, which triggers the `searchFailed` error.
        beforeEnter: to => {
          const serializedQuery = decodeURIComponent(JSON.stringify(to.query))
          if (serializedQuery.includes(SEARCH_ERROR_MARKER)) {
            throw new Error('Mocked navigation failure')
          }
        }
      }
    ])
  ],
  parameters: {
    msw: {
      handlers: {
        contentItemEmbedding: http.get('/api/content-items/:contentItemId', async ({ params }) => {
          const id = String(params.contentItemId)
          await delay(2500)

          if (id === 'fetch-error') {
            return HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
          }

          if (id === 'flaky-item') {
            const attempt = (flakyAttempts.get(id) ?? 0) + 1
            flakyAttempts.set(id, attempt)
            if (attempt % 2 === 1) {
              return HttpResponse.json({ message: 'Temporary failure' }, { status: 503 })
            }
          }

          return HttpResponse.json({
            id,
            semanticEnrichments: {
              embeddings: id === 'without-embedding' ? [] : ['mock-embedding']
            }
          })
        })
      }
    }
  },
  render: args => ({
    components: { AddContentItemToSearchButton },
    setup: () => ({ args }),
    template: '<div class="p-3"><AddContentItemToSearchButton v-bind="args" /></div>'
  })
} satisfies Meta<typeof AddContentItemToSearchButton>

export default meta
type Story = StoryObj<typeof meta>

export const FetchEmbedding: Story = {
  args: { contentItemId: 'example-item' },
  parameters: {
    docs: {
      description: {
        story:
          'The embedding is fetched as soon as the modal opens. The mocked request is delayed to show the loading state, and the confirm button stays disabled until it resolves.'
      }
    }
  }
}

export const ExistingEmbedding: Story = {
  args: {
    contentItemId: 'example-item',
    embedding: 'mock-embedding',
    additionalFilters: [{ type: 'year', q: ['1899', '1900', '1901'] }]
  },
  parameters: {
    docs: {
      description: {
        story:
          'The embedding is provided by the parent, so no request is made when the modal opens.'
      }
    }
  }
}

export const NoEmbedding: Story = {
  args: { contentItemId: 'without-embedding' },
  parameters: {
    docs: {
      description: {
        story:
          'The request succeeds but returns no embedding. The modal shows the `noEmbeddingAvailable` error and the confirm button becomes "Retry".'
      }
    }
  }
}

export const FetchError: Story = {
  args: { contentItemId: 'fetch-error' },
  parameters: {
    docs: {
      description: {
        story:
          'The request fails with a 500. The modal shows the `embeddingFetchFailed` error, and Retry fails again.'
      }
    }
  }
}

export const FetchErrorThenRetry: Story = {
  args: { contentItemId: 'flaky-item' },
  parameters: {
    docs: {
      description: {
        story:
          'The first request fails (503) and the second succeeds. Open the modal, wait for the error, then click Retry. Reopening the modal fails again on the first attempt.'
      }
    }
  }
}

export const EmbeddingFilterNotAllowed: Story = {
  args: {
    contentItemId: 'example-item',
    embedding: 'mock-embedding',
    additionalFilters: [{ type: 'embedding', q: ['another-embedding'] }]
  },
  parameters: {
    docs: {
      description: {
        story:
          '`additionalFilters` contains an embedding filter, which is not allowed. Click "Confirm and search" to see the `embeddingFilterNotAllowed` error.'
      }
    }
  }
}

export const SearchNavigationError: Story = {
  args: {
    contentItemId: 'example-item',
    embedding: SEARCH_ERROR_MARKER
  },
  parameters: {
    docs: {
      description: {
        story:
          'The router guard of the mocked `search` route throws, so `router.push` rejects. Click "Confirm and search" to see the `searchFailed` error.'
      }
    }
  }
}

export const Disabled: Story = {
  args: {
    contentItemId: 'example-item',
    disabled: true,
    disabledReason: 'No semantic embedding is available for this content item.'
  }
}
