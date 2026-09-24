import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse } from 'msw'
import MediaSourceOverview from './MediaSourceOverview.vue'
import type { MediaSourceOverviewProps } from './MediaSourceOverview.vue'
import { MockMediaSources } from '.storybook/mockData/mediaSources'

const successResponse = {
  data: [
    {
      type: 'type',
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

const meta: Meta<typeof MediaSourceOverview> = {
  title: 'components/mediaSource/MediaSourceOverview',
  component: MediaSourceOverview,
  tags: ['autodocs'],
  render: args => ({
    components: { MediaSourceOverview },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100%; max-width: 1200px;">
        <MediaSourceOverview v-bind="args" />
      </div>
    `
  }),
  parameters: {
    msw: {
      handlers: [
        http.get('/api/search-facets/search', async () => {
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
    mediaSource: MockMediaSources[0]
  } as MediaSourceOverviewProps
}
