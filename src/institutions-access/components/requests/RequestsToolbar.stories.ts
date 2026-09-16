import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import RequestsToolbar from './RequestsToolbar.vue'
import type { RequestsToolbarProps } from './RequestsToolbar.vue'

const meta: Meta<typeof RequestsToolbar> = {
  title: 'institutions-access/requests/RequestsToolbar',
  component: RequestsToolbar,
  tags: ['autodocs'],
  args: {
    onExport: fn(),
    onReset: fn()
  },
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        RequestsToolbar
      },
      template: `
        <div style="padding: 16px; background: #f5f4f3">
          <div class="bg-white border rounded-sm">
            <RequestsToolbar v-bind="args" />
          </div>
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    term: '',
    orderBy: '-dateLastModified',
    total: 128
  } as RequestsToolbarProps
}

/** With a search term active, the reset control appears. */
export const Filtered: Story = {
  args: {
    term: 'lovelace',
    orderBy: 'dateLastModified',
    total: 1,
    hasActiveFilters: true
  } as RequestsToolbarProps
}

/** While an export runs, the export menu is disabled. */
export const Exporting: Story = {
  args: {
    term: '',
    orderBy: '-dateLastModified',
    total: 128,
    isExporting: true
  } as RequestsToolbarProps
}

export const NoResults: Story = {
  args: {
    term: 'nobody',
    orderBy: '-dateLastModified',
    total: 0,
    hasActiveFilters: true
  } as RequestsToolbarProps
}
