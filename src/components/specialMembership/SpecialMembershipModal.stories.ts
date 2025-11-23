import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SpecialMembershipModal from './SpecialMembershipModal.vue'
import type { SpecialMembershipModalProps } from './SpecialMembershipModal.vue'
import type { UserSpecialMembershipRequest } from '@/services/types'
import { http, HttpResponse } from 'msw'

const mockRequests: UserSpecialMembershipRequest[] = [
  {
    id: 1,
    reviewerId: null,
    specialMembershipAccessId: 10,
    userId: 42,
    specialMembershipAccess: {
      id: 10,
      reviewerId: null,
      title: 'Data domain Access 10',
      bitmapPosition: 1,
      metadata: { note: 'Test subscription 10' }
    },
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
    status: 'pending',
    changelog: [
      {
        subscription: 'Data domain Access 10',
        date: new Date().toISOString(),
        reviewer: null,
        status: 'pending'
      }
    ]
  },
  {
    id: 2,
    reviewerId: null,
    specialMembershipAccessId: 13,
    userId: 42,
    specialMembershipAccess: {
      id: 13,
      reviewerId: null,
      title: 'Data domain Access 13',
      bitmapPosition: 1,
      metadata: { note: 'Test subscription 13' }
    },
    dateCreated: new Date().toISOString(),
    dateLastModified: new Date().toISOString(),
    status: 'approved',
    changelog: [
      {
        subscription: 'Data domain Access 13',
        date: new Date().toISOString(),
        reviewer: 'Admin User',
        status: 'pending'
      },
      {
        subscription: 'Data domain Access 13',
        date: new Date().toISOString(),
        reviewer: 'Admin User',
        status: 'approved'
      }
    ]
  }
]

const meta: Meta<typeof SpecialMembershipModal> = {
  title: 'modals/SpecialMembershipModal',
  component: SpecialMembershipModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { SpecialMembershipModal },
      template:
        '<div style="height: 500px; width: 100%"><SpecialMembershipModal v-bind="args"></SpecialMembershipModal></div>'
    }
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/user-special-membership-requests', ({ params }) => {
          return HttpResponse.json({
            data: mockRequests,
            pagination: {
              total: mockRequests.length,
              offset: 0,
              limit: 10
            }
          })
        })
      ]
    }
  }
}

export default meta // ← ADD THIS LINE

type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    isVisible: true
  } as SpecialMembershipModalProps
}
