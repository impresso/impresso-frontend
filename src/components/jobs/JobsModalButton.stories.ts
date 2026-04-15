import type { Meta, StoryObj } from '@storybook/vue3-vite'
import JobsModalButton from './JobsModalButton.vue'
import { getJobsHandler } from './JobsModal.stories'

const meta: Meta<typeof JobsModalButton> = {
  title: 'jobs/JobsModalButton',
  component: JobsModalButton,
  tags: ['autodocs'],
  render: () => {
    return {
      components: { JobsModalButton },
      template: `
        <nav class="navbar navbar-dark bg-dark">
          <div class="container-fluid">
            <JobsModalButton />
          </div>
        </nav>
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

export const Default: Story = {}
