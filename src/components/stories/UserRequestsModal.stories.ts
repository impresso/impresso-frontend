import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UserRequestsModal from '@/components/UserRequestsModal.vue'
import { SubscriptionDataset, UserRequest } from '@/services/types'

const meta: Meta<typeof UserRequestsModal> = {
  title: 'Components/UserRequestsModal',
  component: UserRequestsModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { UserRequestsModal },
      template:
        '<div style="height: 600px; width: 100%"><UserRequestsModal v-bind="args"></UserRequestsModal></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    subscriptionDatasets: [
      {
        id: 1,
        name: 'Domain of Swiss Federal Archive',
        bitmapPosition: 1
      },
      {
        id: 2,
        name: 'Domain of CNA archive',
        bitmapPosition: 2
      },
      {
        id: 3,
        name: 'Dataset 3',
        bitmapPosition: 3
      },
      {
        id: 4,
        name: 'Dataset 4',
        bitmapPosition: 4
      },
      {
        id: 5,
        name: 'Dataset 5',
        bitmapPosition: 5
      },
      {
        id: 6,
        name: 'Dataset 6',
        bitmapPosition: 6
      },
      {
        id: 7,
        name: 'Dataset 7',
        bitmapPosition: 7
      },
      {
        id: 8,
        name: 'Dataset 8',
        bitmapPosition: 8
      },
      {
        id: 9,
        name: 'Dataset 9',
        bitmapPosition: 9
      },
      {
        id: 10,
        name: 'Dataset 10',
        bitmapPosition: 10
      }
    ] as SubscriptionDataset[],
    userRequests: [
      {
        // id: number
        // reviewerId: number | null
        // subscriberId: number
        // subscription: SubscriptionDataset | null
        // dateCreated: Date
        // dateLastModified: Date
        // status: 'pending' | 'approved' | 'rejected'
        // changelog: UserRequestChangelogEntry[]
        id: 1,
        subscription: {
          id: 10,
          name: 'Dataset 10',
          bitmapPosition: 10
        },
        dateCreated: new Date(),
        dateLastModified: new Date(),
        status: 'pending'
      }
    ] as UserRequest[],
    isVisible: true,
    isLoadingSubscriptionDatasets: false,
    isLoadingUserRequests: false,
    title: 'Current subscriptions'
  }
}
