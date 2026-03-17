import type { Meta, StoryObj } from '@storybook/vue3'
import SearchResultsSummary from './SearchResultsSummary.vue'
import type { SearchResultsSummaryProps } from './SearchResultsSummary.vue'

const meta: Meta<typeof SearchResultsSummary> = {
  title: 'Components/modules/SearchResultsSummary',
  component: SearchResultsSummary,
  tags: ['autodocs'],
  render: args => {
    ;(window as any).impressoDocumentsYearSpan = { firstYear: 1738, lastYear: 2018 }
    return {
      components: { SearchResultsSummary },
      setup() {
        return { args }
      },
      template: `
        <div style="height: 120px; width: 100%; text-align: start; background: lightgray; padding: 8px;">
          <SearchResultsSummary v-bind="args" />
        </div>
      `
    }
  }
} satisfies Meta<typeof SearchResultsSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    groupBy: 'articles',
    searchQuery: {
      filters: [
        {
          type: 'daterange',
          q: ['1800-01-01T00:00:00Z TO 2000-12-31T23:59:59Z'],
          op: 'AND',
          context: 'include',
          items: [
            {
              id: '1800-01-01T00:00:00Z TO 2000-12-31T23:59:59Z',
              label: '1800-01-01T00:00:00Z TO 2000-12-31T23:59:59Z',
              start: '1800-01-01T00:00:00.000Z',
              end: '2000-12-31T23:59:59.000Z',
              checked: true
            }
          ],
          touched: false
        },
        {
          type: 'person',
          q: [
            '2-50-Robert_Schumann',
            '2-50-Winston_Churchill',
            '2-50-Randolph_Churchill',
            '2-50-John_Churchill$2c$_1._Duke_of_Marlborough',
            '2-50-Clementine_Churchill',
            '2-50-Randolph_Churchill_$28$1911-1968$29$'
          ],
          op: 'OR',
          context: 'include',
          items: [
            {
              id: '2-50-Robert_Schumann',
              label: '2-50-Robert_Schumann',
              name: '',
              type: 'entity',
              countMentions: -1,
              countItems: -1,
              wikidataId: '',
              dbpediaURL: '',
              impressoId: '',
              wikidata: [],
              relevance: -1,
              checked: true
            },
            {
              id: '2-50-Winston_Churchill',
              label: '2-50-Winston_Churchill',
              name: '',
              type: 'entity',
              countMentions: -1,
              countItems: -1,
              wikidataId: '',
              dbpediaURL: '',
              impressoId: '',
              wikidata: [],
              relevance: -1,
              checked: true
            },
            {
              id: '2-50-Randolph_Churchill',
              label: '2-50-Randolph_Churchill',
              name: '',
              type: 'entity',
              countMentions: -1,
              countItems: -1,
              wikidataId: '',
              dbpediaURL: '',
              impressoId: '',
              wikidata: [],
              relevance: -1,
              checked: true
            },
            {
              id: '2-50-John_Churchill$2c$_1._Duke_of_Marlborough',
              label: '2-50-John_Churchill$2c$_1._Duke_of_Marlborough',
              name: '',
              type: 'entity',
              countMentions: -1,
              countItems: -1,
              wikidataId: '',
              dbpediaURL: '',
              impressoId: '',
              wikidata: [],
              relevance: -1,
              checked: true
            },
            {
              id: '2-50-Clementine_Churchill',
              label: '2-50-Clementine_Churchill',
              name: '',
              type: 'entity',
              countMentions: -1,
              countItems: -1,
              wikidataId: '',
              dbpediaURL: '',
              impressoId: '',
              wikidata: [],
              relevance: -1,
              checked: true
            },
            {
              id: '2-50-Randolph_Churchill_$28$1911-1968$29$',
              label: '2-50-Randolph_Churchill_$28$1911-1968$29$',
              name: '',
              type: 'entity',
              countMentions: -1,
              countItems: -1,
              wikidataId: '',
              dbpediaURL: '',
              impressoId: '',
              wikidata: [],
              relevance: -1,
              checked: true
            }
          ],
          touched: false
        },
        {
          type: 'contentLength',
          q: ['207', '781']
        },
        {
          type: 'hasTextContents',
          context: 'include',
          touched: false,
          key: '81639c6d-1619-46f6-b15c-a35da215183d'
        }
      ]
    },
    totalRows: 234657,
    isLoading: false
  } as SearchResultsSummaryProps
}
