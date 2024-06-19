import type { Meta, StoryObj } from '@storybook/vue3'
import TutorialMonitor from '@/components/TutorialMonitor.vue'

const meta: Meta<typeof TutorialMonitor> = {
  title: 'Components/TutorialMonitor',
  component: TutorialMonitor,
  tags: ['autodocs']
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Tutorial Monitor Story',
    isCollapsed: false,
    tasks: [
      {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description for task 1',
        status: 'completed',
        coverUrl: 'https://via.placeholder.com/150'
      },
      {
        id: 'task-2',
        title: 'Task 2',
        description: 'Description for task 2',
        status: 'in-progress'
      },
      {
        id: 'task-3',
        title: 'Task 3',
        description: 'Description for task 3',
        status: 'pending'
      }
    ]
  }
}
