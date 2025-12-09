import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DataRundown from './DataRundown.vue'
import type { DataRelease } from '@/services/types'
import { http, HttpResponse } from 'msw'

const meta = {
  title: 'DataRundown/DataRundown',
  component: DataRundown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card displaying information about a data release.'
      }
    }
  },
  tags: ['autodocs'],
  render: args => ({
    components: { DataRundown },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 500px; height: 600px;">
        <DataRundown v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof DataRundown>

const mockData: DataRelease[] = [
  {
    id: 'MOCKdata-release-2025-05/corpus_release_card.json',
    releaseName: 'Mock Polar Night',
    releaseVersion: '2025-05',
    impressoCorpusOverview: {
      npsStats: {
        titles: 245,
        issues: 3200,
        pages: 89000,
        contentItems: 51000,
        images: 15400,
        tokens: 2_400_000
      }
    }
  }
]

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/datalab/contents/data-release-cards.json', () => {
          return HttpResponse.json(mockData)
        })
      ]
    }
  }
}

export const WithError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/datalab/contents/data-release-cards.json', () => {
          return HttpResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
        })
      ]
    }
  }
}
