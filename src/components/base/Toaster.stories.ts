import type { Meta, StoryObj, Decorator } from '@storybook/vue3'
import Toaster from './Toaster.vue'
import { StoredNotification, useNotificationsStore } from '@/stores/notifications'
import { nextTick } from 'vue'

// Helper function to generate a unique ID
let notificationIdCounter = 100
const getNextId = () => `auto-${notificationIdCounter++}`

// Define the Decorator to manage the Pinia store state
const StoreDecorator: Decorator = (story, context) => ({
  components: { story },
  setup() {
    const notificationsStore = useNotificationsStore()
    notificationsStore.notifications = []
    const addNotification = () => {
      const id = getNextId()
      notificationsStore.addNotification({
        id,
        type: 'info',
        title: `Notification ${id}`,
        message: `This is notification ${id}`
      } as StoredNotification)
    }
    return {
      addNotification
    }
  },
  template: `
    <div style="width: 500px; height: 600px;">
      <story />
      <button @click="addNotification">Add Notification</button>
    </div>
  `
})

const meta: Meta<typeof Toaster> = {
  title: 'Base/Toaster',
  component: Toaster,
  tags: ['autodocs'],
  // Add the decorator to the meta object
  decorators: [StoreDecorator]
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof Toaster>

// --- Stories ---
export const Default: Story = {}
