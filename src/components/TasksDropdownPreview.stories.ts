import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TasksDropdownPreview from './TasksDropdownPreview.vue'
import type { TasksDropdownPreviewProps } from './TasksDropdownPreview.vue'
import Job from '@/models/Job'
import { useJobsStore } from '@/stores/jobs'

const meta: Meta<typeof TasksDropdownPreview> = {
  title: 'Components/TasksDropdownPreview',
  component: TasksDropdownPreview,
  tags: ['autodocs'],
  render: args => ({
    setup() {
      const jobsStore = useJobsStore()
      jobsStore.$patch({
        items: [
          new Job({
            id: 201,
            type: 'EXP',
            status: 'RUN',
            progress: 0.35,
            description: 'Search export - newspaper: GDL',
            creationDate: new Date(Date.now() - 30_000),
            lastModifiedDate: new Date(),
            extra: { progress: 0.35, total: 500, message: 'Preparing…' }
          }),
          new Job({
            id: 200,
            type: 'EXP',
            status: 'DON',
            progress: 1,
            description: 'Export of 8 selected articles',
            creationDate: new Date(Date.now() - 7200_000),
            lastModifiedDate: new Date(Date.now() - 7000_000),
            extra: { progress: 1, total: 8 }
          })
        ],
        totalItems: 2
      })
      return { args }
    },
    components: { TasksDropdownPreview },
    template: `
      <div style="display: flex; justify-content: flex-end; background: #222; padding: 12px;">
        <TasksDropdownPreview v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    maxItems: 4,
    includeAllTypes: false
  } as TasksDropdownPreviewProps
}
