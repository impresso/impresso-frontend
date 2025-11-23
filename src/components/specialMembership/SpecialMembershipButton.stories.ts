import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SpecialMembershipButton from './SpecialMembershipButton.vue'
import type { SpecialMembershipButtonProps } from './SpecialMembershipButton.vue'
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
      metadata: { provider: 'National Library of Scotland', note: 'Test subscription 10' }
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

const meta: Meta<typeof SpecialMembershipButton> = {
  title: 'specialMembership/SpecialMembershipButton',
  component: SpecialMembershipButton,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { SpecialMembershipButton },
      template:
        '<div style="height: 500px; width: 100%"><SpecialMembershipButton v-bind="args"></SpecialMembershipButton></div>'
    }
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/user-special-membership-requests', () => {
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

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    item: mockRequests[0].specialMembershipAccess
  } as SpecialMembershipButtonProps
}

export const withoutItem: Story = {
  args: {} as SpecialMembershipButtonProps
}
