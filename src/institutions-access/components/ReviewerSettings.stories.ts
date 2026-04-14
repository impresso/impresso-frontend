import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import ReviewerSettings from './ReviewerSettings.vue'

const meta: Meta<typeof ReviewerSettings> = {
  title: 'institutions-access/ReviewerSettings',
  component: ReviewerSettings,
  tags: ['autodocs'],
  render: () => {
    return {
      components: { ReviewerSettings },
      template: `<div style="width: 300px; padding: 16px;"><ReviewerSettings /></div>`
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const LoggedIn: Story = {
  decorators: [
    () => {
      setActivePinia(createPinia())
      const store = useUserStore()
      store.userData = {
        email: 'reviewer@impresso-project.ch',
        uid: 'test-uid',
        username: 'reviewer',
        firstname: 'Jane',
        lastname: 'Doe',
        isActive: true,
        isStaff: true
      } as any
      return { template: '<story />' }
    }
  ]
}

export const NotLoggedIn: Story = {
  decorators: [
    () => {
      setActivePinia(createPinia())
      const store = useUserStore()
      store.userData = false
      return { template: '<story />' }
    }
  ]
}
