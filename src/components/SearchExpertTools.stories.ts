import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import type { Filter } from '@/models'
import SearchExpertTools from './SearchExpertTools.vue'
import type { SearchExpertToolsProps } from './SearchExpertTools.vue'

type StoryArgs = SearchExpertToolsProps & {
  onSemanticSearch: (payload: { text: string; embedding: string }) => void
  onFiltersChanged: (filters: Filter[]) => void
}

const meta: Meta<typeof SearchExpertTools> = {
  title: 'Components/SearchExpertTools',
  component: SearchExpertTools,
  tags: ['autodocs'],
  render: args => ({
    components: { SearchExpertTools },
    setup() {
      return { args }
    },
    template: `
      <div class="bg-light p-3" style="max-width: 380px;">
        <SearchExpertTools
          v-bind="args"
          @semantic-search="args.onSemanticSearch"
          @filters-changed="args.onFiltersChanged"
        />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs: StoryArgs = {
  filters: [],
  isBaristaEnabled: false,
  onSemanticSearch: fn(),
  onFiltersChanged: fn()
}

export const BaristaUnavailable: Story = {
  args: defaultArgs
}

export const BaristaAvailable: Story = {
  args: {
    ...defaultArgs,
    isBaristaEnabled: true
  }
}
