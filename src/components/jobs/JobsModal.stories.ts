import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse } from 'msw'
import JobsModal from './JobsModal.vue'
import type { JobsModalProps } from './JobsModal.vue'
import { MockJobs } from '.storybook/mockData/jobs'

export const getJobsHandler = http.get('/api/jobs', async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return HttpResponse.json({
    data: MockJobs,
    pagination: {
      total: MockJobs.length,
      offset: 0,
      limit: 10
    }
  })
})

const meta: Meta<typeof JobsModal> = {
  title: 'jobs/JobsModal',
  component: JobsModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { JobsModal },
      template: `
        <div style="height: 600px; width: 100%">
          <JobsModal v-bind="args" @dismiss="args.isVisible = false" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [getJobsHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isVisible: true
  } as JobsModalProps
}
