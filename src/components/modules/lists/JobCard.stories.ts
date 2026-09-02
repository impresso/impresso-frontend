import type { Meta, StoryObj } from '@storybook/vue3-vite'
import JobCard from './JobCard.vue'
import Job from '@/models/Job'

const meta: Meta<typeof JobCard> = {
  title: 'Components/Lists/JobCard',
  component: JobCard,
  tags: ['autodocs'],
  render: args => ({
    setup() {
      return { args }
    },
    components: { JobCard },
    template: `
      <div style="width: 350px; background: var(--clr-grey-100); padding: 8px;">
        <JobCard v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

const runningJob = new Job({
  id: 101,
  type: 'EXP',
  status: 'RUN',
  progress: 0.42,
  description: 'Search export - newspaper: GDL; date range: 1920-01-01 - 1921-12-31',
  creationDate: new Date(Date.now() - 90_000),
  lastModifiedDate: new Date(),
  extra: {
    progress: 0.42,
    total: 1280,
    message: 'Writing CSV…',
    sq: 'abc123'
  }
})

const doneJob = new Job({
  id: 102,
  type: 'EXP',
  status: 'DON',
  progress: 1,
  description: 'Export of 12 selected articles',
  creationDate: new Date(Date.now() - 3600_000),
  lastModifiedDate: new Date(),
  extra: {
    progress: 1,
    total: 12
  }
})

const cancelledJob = new Job({
  id: 103,
  type: 'EXC',
  status: 'STO',
  progress: 0.15,
  description: 'Export of collection "My Collection"',
  creationDate: new Date(Date.now() - 600_000),
  lastModifiedDate: new Date(),
  extra: {
    progress: 0.15,
    total: 400,
    collection: { id: 'c1', name: 'My Collection', status: 'ACT' }
  }
})

export const Running: Story = {
  args: { item: runningJob }
}

export const Done: Story = {
  args: { item: doneJob }
}

export const Cancelled: Story = {
  args: { item: cancelledJob }
}
