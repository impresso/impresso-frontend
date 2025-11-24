import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ListOfFindResponseItems from './ListOfFindResponseItems.vue'
import type { ListOfFindResponseItemsProps } from './ListOfFindResponseItems.vue'
import type { UserSpecialMembershipRequest } from '@/services/types'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'
import { http, HttpResponse } from 'msw'
import { ref, watch } from 'vue'

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

const meta: Meta<typeof ListOfFindResponseItems> = {
  title: 'components/ListOfFindResponseItems',
  component: ListOfFindResponseItems,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const fetchItemsWhenVisible = ref(false)
        watch(
          () => args.fetchItemsWhenVisible,
          newVal => {
            // debounce change to local state
            setTimeout(() => {
              fetchItemsWhenVisible.value = newVal
            }, 1000)
          },
          { immediate: true }
        )
        return { args, fetchItemsWhenVisible }
      },
      components: { ListOfFindResponseItems },
      template:
        '<div style="height: 500px; width: 100%"><ListOfFindResponseItems :fetchItemsWhenVisible="fetchItemsWhenVisible" :service="args.service"></ListOfFindResponseItems></div>'
    }
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/user-special-membership-requests', async ({ params }) => {
          await new Promise(resolve => setTimeout(resolve, 500)) // simulate network delay
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
    fetchItemsWhenVisible: true,
    service: userSpecialMembershipRequestsService
  } as ListOfFindResponseItemsProps<UserSpecialMembershipRequest>
}
