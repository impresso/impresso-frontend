import type { Meta, StoryObj } from '@storybook/vue3'
import SearchQuerySummary from './SearchQuerySummary.vue'
import type { SearchQuerySummaryProps } from './SearchQuerySummary.vue'
import FilterFactory from '@/models/FilterFactory'

const meta: Meta<typeof SearchQuerySummary> = {
  title: 'Components/modules/SearchQuerySummary',
  component: SearchQuerySummary,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => {
    ;(window as any).impressoDocumentsYearSpan = { firstYear: 1738, lastYear: 2018 }
    return {
      components: { SearchQuerySummary },
      setup() {
        return { args }
      },
      template:
        '<div style="height: 400px; width: 100%; text-align:start; background: lightgray;"><SearchQuerySummary v-bind="args"/></div>'
    }
  },
  decorators: []
} satisfies Meta<typeof SearchQuerySummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    searchQuery: {
      filters: [
        FilterFactory.create({
          type: 'string',
          q: ['lune', 'soleil']
        }),
        FilterFactory.create({
          type: 'language',
          q: ['fr', 'it', 'en', 'fi']
        })
      ]
    }
  } as SearchQuerySummaryProps
}

export const AllFiltersIncluded: Story = {
  args: {
    searchQuery: {
      filters: [
        { context: 'include', type: 'hasTextContents', items: [{ uid: '' }] },
        {
          context: 'include',
          op: 'OR',
          type: 'daterange',
          q: '1948-01-01T00:00:00Z TO 1948-12-31T23:59:59Z',
          items: [{ start: '1948-01-01T00:00:00Z', end: '1948-12-31T23:59:59Z' }]
        },

        { context: 'include', op: 'OR', type: 'language', q: 'fr', items: [{ uid: 'fr' }] },

        {
          context: 'include',
          op: 'OR',
          type: 'person',
          q: '2-50-Harry_S._Truman',
          items: [
            {
              countItems: 0,
              countMentions: 0,
              uid: '2-50-Harry_S._Truman',
              name: 'Harry S. Truman',
              type: 'person'
            }
          ]
        },
        { type: 'copyright', q: 'in_cpy', items: [{ uid: 'in_cpy' }] },
        { context: 'include', op: 'OR', type: 'partner', q: 'SNL', items: [{ uid: 'SNL' }] },
        { type: 'sourceMedium', q: 'print', items: [{ uid: 'print' }] }
      ]
    }
  } as SearchQuerySummaryProps
}
