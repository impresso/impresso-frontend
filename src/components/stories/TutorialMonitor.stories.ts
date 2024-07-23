import type { Meta, StoryObj } from '@storybook/vue3'
import TutorialMonitor from '@/components/TutorialMonitor.vue'
import { TutorialTaskModel } from '@/models/TutorialTask'

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
    initialOpenedTaskId: 'task-search-titanic',
    tasks: [
      {
        title: 'Welcome to Impresso!',
        description:
          'This is your gateway to exploring 200 years of historical newspapers and radio. Don’t know where to start?  Let’s get you on board!'
      },
      {
        title: 'Search "Titanic"',
        id: 'task-search-titanic',
        tasks: [
          {
            title: 'Start your search by entering a keyword',
            description: 'Description for subtask 1',
            status: 'completed',
            completionDate: new Date()
          },
          {
            title: 'Understanding Search results',
            description: 'Description for subtask 2',
            status: 'completed'
          },
          {
            title: 'Similar words? Use "OR"...',
            description: 'Description for subtask 2',
            status: 'completed'
          },
          {
            title: 'An overview of all similar words: word embedding',
            description: 'Description for subtask 2',
            status: 'completed'
          },
          {
            title: 'Esclude non relevant results: "NOT"',
            description: 'Description for subtask 2',
            status: 'completed'
          },
          {
            title: 'Esclude non relevant results: filter by DATE',
            description: 'Description for subtask 2',
            status: 'completed'
          },
          {
            title: 'Explore all the possible filters!'
          }
        ]
      },
      {
        title: 'Task 1',
        description: 'Description for task 1',
        status: 'completed',
        coverUrl: 'https://via.placeholder.com/150',
        tasks: [
          {
            title: 'Subtask 1',
            description: 'Description for subtask 1',
            status: 'completed'
          },
          {
            title: 'Subtask 2',
            description: 'Description for subtask 2',
            status: 'completed'
          }
        ]
      },
      {
        title: 'Task 2',
        description: 'Description for task 2',
        status: 'in-progress'
      },
      {
        title: 'Task 3',
        description: 'Description for task 3',
        status: 'pending'
      }
    ].map((task, index) => new TutorialTaskModel({ ...task, id: task.id ?? `task-${index + 1}` }))
  }
}
