import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'
import { MockSpecialMembershipAccess } from '.storybook/mockData/specialMembership'
import EmailTemplatesView from './EmailTemplatesView.vue'
import type {
  EmailTemplatesViewProps,
  SpecialMembershipPlansService
} from './EmailTemplatesView.vue'
import type { SpecialMembershipAccess } from '@/services/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const createMockPlansService = (
  seed: SpecialMembershipAccess[] = MockSpecialMembershipAccess,
  { failFind = false }: { failFind?: boolean } = {}
): SpecialMembershipPlansService => {
  const store = seed.map(plan => ({ ...plan, metadata: { ...plan.metadata } }))
  return {
    async find() {
      await delay(200)
      if (failFind) throw new Error('Service unavailable')
      return { data: store }
    },
    async patch(id, data) {
      await delay(200)
      const index = store.findIndex(plan => plan.id === id)
      if (index === -1) throw new Error('Not found')
      store[index] = { ...store[index], metadata: data.metadata }
      return store[index]
    }
  }
}

const meta: Meta<typeof EmailTemplatesView> = {
  title: 'institutions-access/views/EmailTemplatesView',
  component: EmailTemplatesView,
  tags: ['autodocs'],
  decorators: [vueRouter()],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        EmailTemplatesView
      },
      template: `
        <div style="padding: 16px; background: var(--impresso-color-paper); min-height: 100vh">
          <EmailTemplatesView v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    service: createMockPlansService()
  } as EmailTemplatesViewProps
}

export const NoPlans: Story = {
  args: {
    service: createMockPlansService([])
  } as EmailTemplatesViewProps
}

export const LoadFailed: Story = {
  args: {
    service: createMockPlansService(MockSpecialMembershipAccess, { failFind: true })
  } as EmailTemplatesViewProps
}
