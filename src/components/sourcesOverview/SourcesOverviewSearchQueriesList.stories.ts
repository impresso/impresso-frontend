import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SourcesOverviewSearchQueriesList from './SourcesOverviewSearchQueriesList.vue'
import { useSearchQueriesStore } from '@/stores/searchQueries'

const meta = {
  title: 'SourceOverview/SourcesOverviewSearchQueriesList',
  component: SourcesOverviewSearchQueriesList,
  tags: ['autodocs'],
  render: () => ({
    components: { SourcesOverviewSearchQueriesList },
    setup() {
      const searchQueriesStore = useSearchQueriesStore()
      searchQueriesStore.$patch({
        entries: [
          {
            hash: 'eyJmaWx0ZXJzIjpbXX0=',
            createdAt: 1744671000000,
            timestamp: 1744673000000,
            summary: 'Based on search query with keyword: migration and date: 1920-1930'
          },
          {
            hash: 'eyJmaWx0ZXJzIjpbeyJ0eXBlIjoiaGFzVGV4dENvbnRlbnRzIn1dfQ==',
            createdAt: 1744670000000,
            timestamp: 1744672000000,
            summary: 'Based on search query with language: fr and newspaper: Gazette de Lausanne'
          },
          {
            hash: 'eyJmaWx0ZXJzIjpbeyJ0eXBlIjoiZGF0ZSJ9XX0=',
            createdAt: 1744660000000,
            timestamp: 1744674000000,
            summary: 'Based on search query with place: Zurich and access right: open'
          }
        ]
      })
      return {}
    },
    template: `
      <div style="width: 700px; padding: 1rem; background: #fff;">
        <SourcesOverviewSearchQueriesList />
      </div>
    `
  })
} satisfies Meta<typeof SourcesOverviewSearchQueriesList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCustomAction: Story = {
  render: () => ({
    components: { SourcesOverviewSearchQueriesList },
    setup() {
      const searchQueriesStore = useSearchQueriesStore()
      searchQueriesStore.$patch({
        entries: [
          {
            hash: 'eyJmaWx0ZXJzIjpbXX0=',
            createdAt: 1744671000000,
            timestamp: 1744673000000,
            summary: 'Based on search query with keyword: migration and date: 1920-1930'
          }
        ]
      })
      return {}
    },
    template: `
      <div style="width: 700px; padding: 1rem; background: #fff;">
        <SourcesOverviewSearchQueriesList>
          <template #action="{ entry }">
            <a
              class="small text-decoration-underline ms-2"
              :href="'/app/search?sq=' + encodeURIComponent(entry.hash)"
            >
              Custom action
            </a>
          </template>
        </SourcesOverviewSearchQueriesList>
      </div>
    `
  })
}
