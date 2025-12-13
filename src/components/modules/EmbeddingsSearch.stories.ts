import type { Meta, StoryObj } from '@storybook/vue3'
import EmbeddingsSearch from './EmbeddingsSearch.vue'
import { http, HttpResponse } from 'msw'
import { MockWordEmbeddings } from '.storybook/mockData/embeddings'

const meta: Meta<typeof EmbeddingsSearch> = {
  component: EmbeddingsSearch,
  title: 'Components/Modules/EmbeddingsSearch',
  tags: ['autodocs'],
  parameters: {
    msw: {
      handlers: {
        getEmbeddings: http.get('/api/embeddings', async ({ request }) => {
          const url = new URL(request.url)
          const limit = parseInt(url.searchParams.get('limit') || '10')
          const offset = parseInt(url.searchParams.get('offset') || '0')
          await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
          const items = MockWordEmbeddings.slice(offset, offset + limit)
          return HttpResponse.json({
            data: items,
            pagination: {
              total: MockWordEmbeddings.length,
              offset: offset,
              limit: limit
            }
          })
        })
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    reduced: false,
    withPreview: true
  }
}
