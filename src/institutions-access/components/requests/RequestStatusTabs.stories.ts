import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'
import RequestStatusTabs from './RequestStatusTabs.vue'
import type { RequestStatusTabsProps } from './RequestStatusTabs.vue'
import { RoutesByRequestStatus } from '../../router/routes'

/** The tabs are links, so the stories need the status routes to resolve. */
const statusRoutes = RoutesByRequestStatus.map(([, path, name]) => ({
  path,
  name,
  component: () => Promise.resolve({ template: '<div />' })
}))

const meta: Meta<typeof RequestStatusTabs> = {
  title: 'institutions-access/requests/RequestStatusTabs',
  component: RequestStatusTabs,
  tags: ['autodocs'],
  decorators: [vueRouter(statusRoutes)],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        RequestStatusTabs
      },
      template: `
        <div style="padding: 16px; background: #f5f4f3">
          <div style="background: #fff; border: 1px solid #d4d5e1; border-radius: 4px; overflow: hidden">
            <RequestStatusTabs v-bind="args" />
          </div>
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const WithCounts: Story = {
  args: {
    status: 'pending',
    counts: {
      all: 128,
      pending: 12,
      temporary: 7,
      approved: 94,
      rejected: 9,
      revoked: 6
    }
  } as RequestStatusTabsProps
}

/** Counts are omitted until they have loaded. */
export const WithoutCounts: Story = {
  args: {
    status: 'all'
  } as RequestStatusTabsProps
}

export const EmptyQueues: Story = {
  args: {
    status: 'rejected',
    counts: {
      all: 0,
      pending: 0,
      temporary: 0,
      approved: 0,
      rejected: 0,
      revoked: 0
    }
  } as RequestStatusTabsProps
}
