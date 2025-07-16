import type { Meta, StoryObj } from '@storybook/vue3'
import DataRelease from './DataReleaseCard.vue'
import type { DataReleaseCardProps } from './DataReleaseCard.vue'
import type { DataRelease as DataReleaseType } from '@/services/types'

const meta = {
  title: 'DataRundown/DataRelease',
  component: DataRelease,
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
    components: { DataRelease },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 500px; height: 600px;">
        <DataRelease v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof DataRelease>

const mockData: DataReleaseType = {
  id: 'data-release-2025-05/corpus_release_card.json',
  releaseName: 'polar night',
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

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataRelease: mockData,
    isLoading: false,
    orderedNpsStats: ['titles', 'issues', 'pages', 'contentItems', 'images', 'tokens']
  } as DataReleaseCardProps
}
